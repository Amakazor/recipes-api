/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_JWT_SECRET: string
    readonly VITE_DATABASE_HOST: string
    readonly VITE_DATABASE_PORT: string
    readonly VITE_DATABASE_USER: string
    readonly VITE_DATABASE_PASSWORD: string
    readonly VITE_DATABASE_NAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
