import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable specific ESLint rules
      "no-unused-vars": "off", // Disable 'no-unused-vars'
      "react/prop-types": "off", // Disable prop-types check (if you don't use PropTypes)
      "react/jsx-key": "off", // Disable warning for missing `key` prop in lists
      // Add more rules as needed
    },
  },
];

export default eslintConfig;
