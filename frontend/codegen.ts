import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: "http://localhost:8000/graphql/",
    documents: "src/**/*.graphql",
    generates: {
        "src/app/graphql/generated.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-apollo-angular"
            ]
        }
    }
};

export default config;
