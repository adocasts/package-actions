import { test } from '@japa/runner'
import { AceFactory } from '@adonisjs/core/factories'
import MakeAction from '../../commands/make_action.js'

test.group('MakeAction', (group) => {
  group.each.teardown(async () => {
    delete process.env.ADONIS_ACE_CWD
  })

  test('make an action', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['StoreUserFromForm'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/store_user_from_form.ts')
    await assert.fileContains(
      'app/actions/store_user_from_form.ts',
      'export default class StoreUserFromForm {'
    )
    await assert.fileContains('app/actions/store_user_from_form.ts', `async handle() {`)
  })

  test('make a feature action', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(MakeAction, ['update_user_from_form', '--feature=users'])
    await command.exec()

    command.assertLog('green(DONE:)    create app/actions/users/update_user_from_form.ts')
    await assert.fileContains(
      'app/actions/users/update_user_from_form.ts',
      'export default class UpdateUserFromForm {'
    )
    await assert.fileContains('app/actions/users/update_user_from_form.ts', `async handle() {`)
  })

  test('make an http action', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)
    await ace.app.init()
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
      `import type { HttpContext } from '@adonisjs/core/http'`
    )
    await assert.fileContains(
      'app/actions/update_user_from_form.ts',
      `constructor(protected ctx: HttpContext) {}`
    )
  })
})
