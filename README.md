# @adocasts.com/actions

Easily strub new action classes inside your AdonisJS 6 project

## Install with the Ace CLI

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

## The Make Action Command

Once `@adocasts.com/actions` is installed & configured in your application,
you'll have access to the `node ace make:action [name]` command.

For example, to create a `RegisterFromForm` action, you can do:

```shell
node ace make:action RegisterUser
```

Which creates an action class at: `app/actions/register_user.ts`

```ts
type Params = {}

export default class RegisterUser {
  static async handle({}: Params) {
    // do stuff
  }
}
```

### Features

Apps have lots of actions they perform, so it's a great idea to group them into feature/resource folders.
This can be easily done via the `--feature` flag.

```shell
node ace make:action register_user --feature=auth
```

This will then create our action class at:

```shell
app/actions/auth/register_from_form.ts
```

Also, note in both the above examples, the file name was normalized.

### HTTP Actions

Though actions are typically meant to be self contained, if your action is only going to handle an HTTP Request, you can optionally include an injection of the `HttpContext` directly within your action class via the `--http` flag.
This, obviously, is up to you/your team with whether you'd like to use it.

```shell
node ace make:action register_user --http --feature=auth
```

Which then creates: `app/actions/auth/register_from_form.ts`

```ts
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

type Params = {}

@inject()
export default class RegisterUser {
  constructor(protected ctx: HttpContext) {}

  async handle({}: Params) {
    // do stuff
  }
}
```

Unfamiliar with this approach? You can learn more via the [AdonisJS HTTP Context documentation](https://docs.adonisjs.com/guides/concepts/http-context#injecting-http-context-using-dependency-injection).

## Full Example

What does this look like in practice? Let's take a look! Lets say we have a simple `Difficulty` model

```ts
// app/models/difficulty.ts

export default class Difficulty extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare organizationId: number

  @column()
  declare name: string

  @column()
  declare color: string

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>
}
```

#### Step 1: Creating Our Controller

First, we'll want to create a controller, this will be in charge of taking in the request and returning a response.

```shell
node ace make:controller difficulty store update
```

For our example, we'll stub it with a `store` and `update` method, and the generated file will look like this:

```ts
// app/controllers/difficulties_controller.ts

import type { HttpContext } from '@adonisjs/core/http'

export default class DifficultiesController {
  async store({}: HttpContext) {}

  async update({}: HttpContext) {}
}
```

Cool, now let's get it taking in the request and returning a response for both handlers.

```ts
// app/controllers/difficulties_controller.ts

import { difficultyValidator } from '#validators/difficulty'
import type { HttpContext } from '@adonisjs/core/http'

export default class DifficultiesController {
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(difficultyValidator)

    // TODO: create the difficulty

    return response.redirect().back()
  }

  async update({ request, response, params }: HttpContext) {
    const data = await request.validateUsing(difficultyValidator)

    // TODO: update the difficulty

    return response.redirect().back()
  }
}
```

#### Step 2: Creating Our Actions

Think of actions like single-purpose service classes.
We'll have a single file meant to perform one action.
As you may have guessed, this means we'll have a good number of actions within our application,
so we'll also want to nest them within folders to help scope them.
The depth of this will be determined by the complexity of your application.

Our application is simple, so let's nest ours within a single "resource" feature folder called `difficulties`.

So, we'll have one action to create a difficulty:

```shell
node ace make:action create_difficulty --feature=difficulties
```

And, another to update a difficulty:

```shell
node ace make:action difficulties/create_difficulty
```

Note, you can easily nest within folders by either using the `--feature` flag or including the folder path in the name parameter.

#### Step 3: Defining Our Actions

When we create an action, we're provided an empty `Params` type.
We'll want to fill that in with our handler's expected parameters.
Then, handle the needed operations to complete an action

Here's our CreateDifficulty action:

```ts
// app/actions/difficulties/create_difficulty.ts

import Organization from '#models/organization'
import { difficultyValidator } from '#validators/difficulty'
import { Infer } from '@vinejs/vine/types'

type Params = {
  organization: Organization
  data: Infer<typeof difficultyValidator>
}

export default class CreateDifficulty {
  static async handle({ organization, data }: Params) {
    // finds the next `order` for the organization
    const order = await organization.findNextSort('difficulties')

    // creates the difficulty scoped to the organization
    return organization.related('difficulties').create({
      ...data,
      order,
    })
  }
}
```

Assupmtion: the organization has a method on it called `findNextSort`

And, our UpdateDifficulty action:

```ts
// app/actions/difficulties/update_difficulty.ts

import Organization from '#models/organization'
import { difficultyValidator } from '#validators/difficulty'
import { Infer } from '@vinejs/vine/types'

type Params = {
  organization: Organization
  id: number
  data: Infer<typeof difficultyValidator>
}

export default class UpdateDifficulty {
  static async handle({ organization, id, data }: Params) {
    // find the existing difficulty via id within the organization
    const difficulty = await organization
      .related('difficulties')
      .query()
      .where({ id })
      .firstOrFail()

    // merge in new data and update
    await difficulty.merge(data).save()

    // return the updated difficulty
    return difficulty
  }
}
```

#### Step 4: Using Our Actions

Lastly, we just need to use our actions inside our controller.

```ts
// app/controllers/difficulties_controller.ts

import CreateDifficulty from '#actions/difficulties/create_difficulty'
import UpdateDifficulty from '#actions/difficulties/update_difficulty'
import { difficultyValidator } from '#validators/difficulty'
import type { HttpContext } from '@adonisjs/core/http'

export default class DifficultiesController {
  async store({ request, response, organization }: HttpContext) {
    const data = await request.validateUsing(difficultyValidator)

    await CreateDifficulty.handle({ organization, data })

    return response.redirect().back()
  }

  async update({ params, request, response, organization }: HttpContext) {
    const data = await request.validateUsing(difficultyValidator)

    await UpdateDifficulty.handle({
      id: params.id,
      organization,
      data,
    })

    return response.redirect().back()
  }
}
```

Assumption: the organization is being added onto the HttpContext within a middleware prior to our controller being called.
