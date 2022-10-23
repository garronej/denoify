import { describe, it, expect } from "vitest";
import { getValidImportUrlFactory } from "../src/lib/resolveNodeModuleToDenoModule";
import { ModuleAddress } from "../src/lib/types/ModuleAddress";
import { parseGetValidImportUrlResultAsCouldConnect } from "./resolveNodeModuleToDenoModule/getValidImportUrl/shared";

const testParseAndReadConfigFile = () =>
    describe("get config file and parse its content", () => {
        it("should get the url of my_dummy_npm_and_deno_module_test_config_file without specifying out", async () => {
            const userOrOrg = "garronej";
            const repositoryName = "my_dummy_npm_and_deno_module_test_config_file";
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                userOrOrg,
                repositoryName,
                "branch": undefined
            };

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "1.0.0"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { getValidImportUrl, versionFallbackWarning } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(versionFallbackWarning).toBeUndefined();
            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/1.0.0/deno_dist/mod.ts`
            );
            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })).toBe(
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/1.0.0/deno_dist/lib/Cat.ts`
            );
        });

        it("should get the url of my_dummy_npm_and_deno_module_test_config_file_2 with a specified out", async () => {
            const userOrOrg = "garronej";
            const repositoryName = "my_dummy_npm_and_deno_module_test_config_file_2";
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                userOrOrg,
                repositoryName,
                "branch": undefined
            };

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "1.0.0"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(versionFallbackWarning).toBeUndefined();
            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/v1.0.0/custom_deno_dist_dir_name/mod.ts`
            );
            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })).toBe(
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/v1.0.0/custom_deno_dist_dir_name/lib/Cat.ts`
            );
        });

        it("should get the url of my_dummy_npm_and_deno_module_test_config_file_3 with a specified out", async () => {
            const userOrOrg = "garronej";
            const repositoryName = "my_dummy_npm_and_deno_module_test_config_file_3";
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                userOrOrg,
                repositoryName,
                "branch": undefined
            };

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "1.0.0"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(versionFallbackWarning).toBeUndefined();
            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/1.0.0/custom_deno_dist_dir_name/mod.ts`
            );
            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })).toBe(
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/1.0.0/custom_deno_dist_dir_name/lib/Cat.ts`
            );
        });
    });

export default testParseAndReadConfigFile;
