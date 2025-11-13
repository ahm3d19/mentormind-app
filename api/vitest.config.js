"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        environment: "happy-dom",
        globals: true,
        setupFiles: ["./__tests__/setup.ts"],
        coverage: {
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "__tests__/", "src/server.ts"],
        },
    },
    resolve: {
        alias: {
            "@": "./src",
        },
    },
});
//# sourceMappingURL=vitest.config.js.map