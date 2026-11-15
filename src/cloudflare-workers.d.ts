declare module "cloudflare:workers" {
  export const env: {
    AI: {
      run(
        model: string,
        input: {
          messages: Array<{
            role: "system" | "user" | "assistant";
            content: string;
          }>;
          max_tokens: number;
          temperature: number;
        },
      ): Promise<unknown>;
    };
  };
}
