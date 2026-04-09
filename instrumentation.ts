export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerInMemoryDatabase } = await import(
      "./instrumentation-node"
    );
    registerInMemoryDatabase();
  }
}
