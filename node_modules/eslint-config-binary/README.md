# eslint-config-binary
Eslint shared config for binary.com applications

It extends the configs from [airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) & [prettier](https://github.com/prettier/eslint-config-prettier/).

This plugin is meant to be used with [prettier-eslint](https://github.com/prettier/prettier-eslint).

# Installation
Using `yarn`:

```
yarn add -D eslint-config-binary
```

Using `npm`:

```
npm i -D eslint-config-binary
```

# Usage
Add eslint-config-binary to the "extends" array in your `.eslintrc.*` file. Make sure to put it **last**, so it gets the chance to override other configs

```
{
  "extends": [
    "binary"
  ]
}

```
