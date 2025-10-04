interface ImportMetaEnv {
  readonly HYGRAPH_ENDPOINT: string;
  readonly HYGRAPH_PERMANENT_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
