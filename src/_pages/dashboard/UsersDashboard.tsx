"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { UserEntity, UserProfileEntity } from "@db/types";

import Button from "@shared/ui/Button";
import Icon from "@shared/ui/Icon";
import LoadingSpinner from "@shared/ui/LoadingSpinner";
import UserRow from "@shared/ui/UserRow";

import CreateUserSheet, {
  emptyDraft,
  type CreateDraft,
} from "./components/CreateUserSheet";
import UnsavedChangesDialog from "./components/UnsavedChangesDialog";
import UserDetailSheet from "./components/UserDetailSheet";
import UserListSkeleton from "./components/UserListSkeleton";
import { apiJson, fetchUsers } from "./lib/api";

function formatFullName(u: Pick<UserEntity, "surname" | "name" | "middlename">) {
  return `${u.surname} ${u.name} ${u.middlename}`.trim();
}

type Sheet =
  | { kind: "none" }
  | { kind: "create"; step: "form" | "code"; draft: CreateDraft }
  | { kind: "detail"; userId: string };

export default function UsersDashboard({
  initialCreateOpen,
}: {
  initialCreateOpen?: boolean;
}) {
  const [users, setUsers] = useState<UserEntity[] | null>(null);
  const [sheet, setSheet] = useState<Sheet>({ kind: "none" });
  const [pending, setPending] = useState(false);
  const [detailProfile, setDetailProfile] = useState<UserProfileEntity | null>(
    null,
  );
  const [detailDirty, setDetailDirty] = useState(false);
  const [discardUnsavedOpen, setDiscardUnsavedOpen] = useState(false);

  const refreshUsers = useCallback(async () => {
    const list = await fetchUsers();
    setUsers(list);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshUsers();
      } catch {
        setUsers([]);
      }
    })();
  }, [refreshUsers]);

  useEffect(() => {
    if (initialCreateOpen) {
      setSheet({
        kind: "create",
        step: "form",
        draft: emptyDraft(),
      });
    }
  }, [initialCreateOpen]);

  const detailUserId = sheet.kind === "detail" ? sheet.userId : undefined;

  useEffect(() => {
    if (!detailUserId) {
      setDetailProfile(null);
      setDetailDirty(false);
      return;
    }
    let cancelled = false;
    void apiJson<UserProfileEntity>(`/api/users/${detailUserId}`).then(
      (p) => {
        if (!cancelled) setDetailProfile(p);
      },
      () => {
        if (!cancelled) setDetailProfile(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [detailUserId]);

  const overlayOpen = sheet.kind !== "none";

  const closeOverlay = () => {
    setSheet({ kind: "none" });
  };

  const tryCloseOverlay = () => {
    if (sheet.kind === "detail" && detailDirty) {
      setDiscardUnsavedOpen(true);
      return;
    }
    closeOverlay();
  };

  const confirmDiscardUnsaved = () => {
    setDiscardUnsavedOpen(false);
    closeOverlay();
  };

  return (
    <div className="flex min-h-[max(792px,100dvh)] w-full min-w-0 flex-1 bg-background-none">
      <aside
        className="flex w-[76px] shrink-0 flex-col items-stretch border-r border-stroke-med bg-background-none px-2 pb-3"
        aria-label="Меню"
      >
        <div className="flex h-[120px] shrink-0 flex-col items-center justify-center px-2 py-10">
          <Image src="/LogoIcon.svg" alt="" width={44} height={36} priority />
        </div>
        <div className="min-h-0 flex-1" aria-hidden />
      </aside>

      <div className="relative flex min-h-[max(792px,100dvh)] min-w-0 flex-1 flex-col rounded-tl-l rounded-tr-l bg-background-none">
        {pending ? (
          <div
            className="pointer-events-auto absolute inset-0 z-45 flex items-center justify-center bg-basic-max/10"
            aria-busy="true"
            aria-live="polite"
          >
            <LoadingSpinner size={48} />
          </div>
        ) : null}
        {overlayOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-30 cursor-default bg-basic-max/20"
            aria-label="Закрыть панель"
            onClick={tryCloseOverlay}
          />
        ) : null}

        <header className="relative z-10 flex shrink-0 items-center gap-3 px-8 pb-4 pt-10">
          <div className="h-9 w-11 shrink-0" />
          <h1 className="flex min-w-0 flex-1 justify-center text-center text-h2 text-symb-primary">
            Пользователи
          </h1>
          <div className="h-9 w-11 shrink-0" />
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-8 pb-10 pt-0">
          <div className="flex flex-col gap-2">
            {users === null ? (
              <UserListSkeleton count={6} />
            ) : (
              users.map((u) => (
                <UserRow
                  key={u.id}
                  name={formatFullName(u)}
                  confirmed={u.phoneVerified}
                  disabled={pending}
                  onClick={() => setSheet({ kind: "detail", userId: u.id })}
                />
              ))
            )}
          </div>

          <div className="mt-2 shrink-0">
            <Button
              variant="tertiary"
              size="M"
              type="button"
              disabled={pending}
              aria-label="Добавить пользователя"
              onClick={() =>
                setSheet({
                  kind: "create",
                  step: "form",
                  draft: emptyDraft(),
                })
              }
              className="border border-stroke-med px-4 py-2.5 [&_span.icon]:text-xl"
            >
              <Icon name="add" size={24} className="text-symb-primary" />
            </Button>
          </div>
        </div>

        {sheet.kind === "create" ? (
          <CreateUserSheet
            draft={sheet.draft}
            setDraft={(d) =>
              setSheet((s) => (s.kind === "create" ? { ...s, draft: d } : s))
            }
            step={sheet.step}
            setStep={(st) =>
              setSheet((s) => (s.kind === "create" ? { ...s, step: st } : s))
            }
            pending={pending}
            setPending={setPending}
            onClose={tryCloseOverlay}
            onConfirmed={async (userId) => {
              await refreshUsers();
              setSheet({ kind: "detail", userId });
            }}
          />
        ) : null}

        {sheet.kind === "detail" && detailProfile ? (
          <UserDetailSheet
            profile={detailProfile}
            pending={pending}
            setPending={setPending}
            onClose={() => setSheet({ kind: "none" })}
            onUnsavedCloseAttempt={() => setDiscardUnsavedOpen(true)}
            onSaved={(p) => {
              setDetailProfile(p);
              void refreshUsers();
            }}
            onDirtyChange={setDetailDirty}
          />
        ) : null}

        {sheet.kind === "detail" && !detailProfile ? (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-40 flex h-full w-[400px] flex-col justify-center rounded-br-l rounded-tr-l bg-background-none shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]"
            aria-busy="true"
            aria-live="polite"
            aria-label="Загрузка профиля"
          >
            <div className="flex flex-col items-center justify-center px-8 py-12">
              <LoadingSpinner size={48} />
            </div>
          </div>
        ) : null}

        <UnsavedChangesDialog
          open={discardUnsavedOpen}
          onStay={() => setDiscardUnsavedOpen(false)}
          onDiscard={confirmDiscardUnsaved}
        />
      </div>
    </div>
  );
}
