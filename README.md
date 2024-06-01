# @adocasts.com/actions

Easily strub new action classes inside your AdonisJS 6 project

## Install With Ace
  ```shell
  node ace add @adocasts.com/actions
  ```
- Installs `@adocasts.com/actions`.
- Automatically configures the `make:action` command via your `adonisrc.ts` file.

## Manual Install & Configure
First, install
```shell
npm i @adocasts.com/actions@latest
```
Then, configure
```shell
node ace configure @adocasts.com/actions
```

## Using
Once `@adocasts.com/actions` is installed & configured in your application, 
you'll have access to `node ace make:actions [name]`.

For example, to create a `RegisterFromForm` action, you can do:
```shell
node ace make:action RegisterFromForm
```
Which creates an action class at:
```shell
app/actions/register_from_form.ts
```

### Features
Apps have lots of actions, so it's a great idea to group them into feature/resource folders. 
This can be easily done via the `--feature` flag.
```shell
node ace make:action register_from_form --feature=auth
```
This will then create our action class at:
```shell
app/actions/auth/register_from_form.ts
```
Also, note in both the above examples, the file name was normalized.

### HTTP Actions
If your action is going to handle an HTTP Request, you can optionally include an injection of the `HttpContext` directly within your action class via the `--http` flag.
```shell
node ace make:action register_from_form --http --feature=auth
```

