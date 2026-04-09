"use client"

import Button from "@shared/ui/Button";

export default function ClientButton() {

  return (
    <Button variant="primary" size="L"
      onClick={() => alert("Hello world!")}
    >
      <span>Кнопка</span>
    </Button>
  )
}