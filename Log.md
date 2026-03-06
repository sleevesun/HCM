The Netlify deploy errored, with the following guidance provided:

Diagnosis
- The type-checker step (vue-tsc) failed during the build. The two relevant errors are shown in the logs: [line 60](#L60) and [line 61](#L61).
  - [line 60](#L60) TS2698: "Spread types may only be created from object types" in src/components/BeforeApplicationDetail.vue — you're spreading a value/type that TypeScript does not recognize as an object.
  - [line 61](#L61) TS6133: "'text' is declared but its value is never read" in src/components/SalaryEditModal.vue — an unused variable triggers a TS error under your config.

Cause
- vue-tsc (static type checking) runs as part of npm run build (the script runs vue-tsc && vite build). Type errors stop the build. Specifically:
  - BeforeApplicationDetail.vue contains a spread operation (e.g. { ...something }) where something has a type that can be non-object (primitive, union including non-object, or possibly undefined/null), or you used a spread inside a TypeScript type (which is not allowed).
  - SalaryEditModal.vue declares a variable/parameter named text but never uses it; your TS config treats unused locals as an error.

Solution
1) Inspect the failing files
- Open the files to see the exact code lines:
  - BeforeApplicationDetail.vue: https://github.com/sleevesun/HCM/blob/main/HCM0107/src/components/BeforeApplicationDetail.vue
  - SalaryEditModal.vue: https://github.com/sleevesun/HCM/blob/main/HCM0107/src/components/SalaryEditModal.vue

2) Fix the spread error (TS2698)
- Ensure you only spread an object. Typical fixes:
  - If the value may be undefined/null, give it a safe default before spreading:
    ```ts
    const safe = maybeObj ?? {};
    const result = { ...safe, otherProp: 1 };
    ```
  - If TypeScript's type is a union that includes non-object members, tighten the type or assert it's an object before spreading:
    ```ts
    // If you're sure it's an object at runtime:
    const result = { ...(maybeObj as Record<string, unknown>) };
    ```
  - If you accidentally used spread in a type position (e.g. type New = { ...SomeType } ), replace with an intersection or mapped type:
    ```ts
    // instead of `type New = { ...SomeType }` do:
    type New = SomeType & { extraProp?: string };
    ```
- Apply the edit in BeforeApplicationDetail.vue at the reported location so the operand of ... is an object (or provide a default {}).

3) Fix the unused variable error (TS6133)
- Remove the unused variable/parameter named text, or rename it to start with an underscore to intentionally ignore it, or use it where intended:
  - Remove:
    ```ts
    // remove `text` if not used
    const doSomething = () => { /* ... */ }
    ```
  - Rename to ignore:
    ```ts
    function handler(_text: string) { /* if param intentionally unused */ }
    ```
  - Or use the variable where intended.
- Edit SalaryEditModal.vue accordingly.

4) Quick temporary/workaround (if you need to deploy immediately)
- If you cannot fix the types immediately and want the site to build while you fix type issues, temporarily skip type check in the build script (not recommended long-term). In package.json change:
  ```json
  "scripts": {
    "build": "vite build"
  }
  ```
  - Commit and redeploy. Note: this bypasses vue-tsc and lets Vite build but you lose static type checking during CI.

5) Re-run build
- Commit the fixes and push. Netlify will re-run npm run build. The build script in your netlify.toml uses the project base HCM0107 and runs npm run build (so commit to the repo branch that Netlify builds).

Notes and pointers
- The errors come from the type checker (vue-tsc) and not Vite itself; fixing the TypeScript issues in the two files will allow the build to succeed.
- If you still see Node version issues later, follow Netlify’s docs for changing Node versions: https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript

If you want, paste the exact snippets around the reported lines and I can propose the minimal code change to fix each error.

The relevant error logs are:

Line 0: build-image version: 8c9b1115cf47daa4d19510cfee34034469213d7a (noble-new-builds)
Line 1: buildbot version: c45dd31339e02bebd642dfcbf12816bab6e27e1b
Line 2: Fetching cached dependencies
Line 3: Failed to fetch cache, continuing with build
Line 4: Starting to prepare the repo for build
Line 5: No cached dependencies found. Cloning fresh repo
Line 6: git clone --filter=blob:none https://github.com/sleevesun/HCM
Line 7: Preparing Git Reference refs/heads/main
Line 8: Custom publish path detected. Proceeding with the specified path: 'HCM0107/dist'
Line 9: Custom build command detected. Proceeding with the specified command: 'npm run build'
Line 10: Installing dependencies
Line 11: mise [36m~/.config/mise/config.toml[0m tools: [34mpython[0m@3.14.3
Line 12: mise [36m~/.config/mise/config.toml[0m tools: [34mruby[0m@3.4.8
Line 13: mise [36m~/.config/mise/config.toml[0m tools: [34mgo[0m@1.26.0
Line 50: [36m[1m​[22m[39m
Line 51: [36m[1m❯ Loading extensions[22m[39m
Line 52:    - neon
Line 53: [96m[1m​[22m[39m
Line 54: [96m[1mbuild.command from netlify.toml                               [22m[39m
Line 55: [96m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 56: ​
Line 57: [36m$ npm run build[39m
Line 58: > hcm-0107@0.0.0 build
Line 59: > vue-tsc && vite build
Line 60: src/components/BeforeApplicationDetail.vue(202,10): error TS2698: Spread types may only be created from object types.
Line 61: src/components/SalaryEditModal.vue(29,40): error TS6133: 'text' is declared but its value is never read.
Line 62: [91m[1m​[22m[39m
Line 63: [91m[1m"build.command" failed                                        [22m[39m
Line 64: [91m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 65: ​
Line 66:   [31m[1mError message[22m[39m
Line 67:   Command failed with exit code 2: npm run build
Line 68: ​
Line 69:   [31m[1mError location[22m[39m
Line 70:   In build.command from netlify.toml:
Line 71:   npm run build
Line 72: ​
Line 73:   [31m[1mResolved config[22m[39m
Line 74:   build:
Line 75:     base: /opt/build/repo/HCM0107
Line 76:     command: npm run build
Line 77:     commandOrigin: config
Line 78:     publish: /opt/build/repo/HCM0107/dist
Line 79:     publishOrigin: config
Line 80:   redirects:
Line 81:     - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
Line 82: Build failed due to a user error: Build script returned non-zero exit code: 2
Line 83: Failing build: Failed to build site
Line 84: Failed during stage 'building site': Build script returned non-zero exit code: 2
Line 85: Finished processing build request in 31.698s