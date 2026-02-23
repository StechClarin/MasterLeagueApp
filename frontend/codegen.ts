import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        {
            "http://127.0.0.1:8000/graphql/": {
                headers: {
                    Authorization: `Bearer ${process.env['JWT_TOKEN']}`
                }
            }
        }
    ],
    documents: "src/**/*.graphql",
    generates: {
        "src/app/graphql/types.ts": {
            plugins: ["typescript"]
        },
        "src/": {
            preset: "near-operation-file",
            presetConfig: {
                extension: ".generated.ts",
                baseTypesPath: "app/graphql/types.ts"
            },
            plugins: [
                "typescript-operations",
                "typescript-apollo-angular"
            ]
        }
    }
};

export default config;
