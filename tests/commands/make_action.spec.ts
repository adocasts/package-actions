import { test } from '@japa/runner'
import { AceFactory } from '@adonisjs/core/factories'
import MakeAction from '../../commands/make_action.js'

test.group('MakeAction', (group) => {
  group.each.teardown(async () => {
    delete process.env.ADONIS_ACE_CWD
  })

  test('make an action', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)

    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['StoreUserFromForm'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/store_user_from_form.ts')
    await assert.fileContains(
      'app/actions/store_user_from_form.ts',
      'export default class StoreUserFromForm {'
    )
    await assert.fileContains(
      'app/actions/store_user_from_form.ts',
      `static async handle({}: Params) {`
    )
  })

  test('make a feature action', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)

    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['update_user_from_form', '--feature=users'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/users/update_user_from_form.ts')
    await assert.fileContains(
      'app/actions/users/update_user_from_form.ts',
      'export default class UpdateUserFromForm {'
    )
    await assert.fileContains(
      'app/actions/users/update_user_from_form.ts',
      `static async handle({}: Params) {`
    )
  })

  test('make resourceful actions', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)

    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['users', '--resource'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/users/get_user.ts')
    command.assertLog('green(DONE:)    create app/actions/users/get_users.ts')
    command.assertLog('green(DONE:)    create app/actions/users/store_user.ts')
    command.assertLog('green(DONE:)    create app/actions/users/update_user.ts')
    command.assertLog('green(DONE:)    create app/actions/users/destroy_user.ts')

    await assert.fileContains('app/actions/users/get_user.ts', 'export default class GetUser {')
    await assert.fileContains('app/actions/users/get_users.ts', 'export default class GetUsers {')
    await assert.fileContains('app/actions/users/store_user.ts', 'export default class StoreUser {')
    await assert.fileContains(
      'app/actions/users/update_user.ts',
      'export default class UpdateUser {'
    )
    await assert.fileContains(
      'app/actions/users/destroy_user.ts',
      'export default class DestroyUser {'
    )
  })

  test('make an http action', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)

    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['update_user_from_form', '--http'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/update_user_from_form.ts')
    await assert.fileContains(
      'app/actions/update_user_from_form.ts',
      '@inject()\nexport default class UpdateUserFromForm {'
    )
    await assert.fileContains(
      'app/actions/update_user_from_form.ts',
      `import { HttpContext } from '@adonisjs/core/http'`
    )
    await assert.fileContains(
      'app/actions/update_user_from_form.ts',
      `constructor(protected ctx: HttpContext) {}`
    )
  })

  test('make resourceful http actions', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)

    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['users', '--resource', '--http'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/users/get_user.ts')
    command.assertLog('green(DONE:)    create app/actions/users/get_users.ts')
    command.assertLog('green(DONE:)    create app/actions/users/store_user.ts')
    command.assertLog('green(DONE:)    create app/actions/users/update_user.ts')
    command.assertLog('green(DONE:)    create app/actions/users/destroy_user.ts')

    await assert.fileContains(
      'app/actions/users/get_user.ts',
      '@inject()\nexport default class GetUser {'
    )
    await assert.fileContains(
      'app/actions/users/get_users.ts',
      '@inject()\nexport default class GetUsers {'
    )
    await assert.fileContains(
      'app/actions/users/store_user.ts',
      '@inject()\nexport default class StoreUser {'
    )
    await assert.fileContains(
      'app/actions/users/update_user.ts',
      '@inject()\nexport default class UpdateUser {'
    )
    await assert.fileContains(
      'app/actions/users/destroy_user.ts',
      '@inject()\nexport default class DestroyUser {'
    )
  })

  test('make resourceful actions in a pluralized folder', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)

    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['user', '--resource'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/users/get_user.ts')

    await assert.fileContains('app/actions/users/get_user.ts', 'export default class GetUser {')
  })
})
