import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { generators } from '@adonisjs/core/app'
import { stubsRoot } from '../stubs/main.js'

export default class MakeAction extends BaseCommand {
  static commandName = 'make:action'
  static description = 'Create a new action handler class'
  static options: CommandOptions = {}

  @args.string({ description: 'Name of the action' })
  declare name: string

  @flags.string({
    description: 'Specify a feature folder to add the action to',
    alias: 'f',
  })
  declare feature?: string

  @flags.boolean({
    description: 'Inject HTTP Context into the action',
    showNegatedVariantInHelp: true,
    alias: 'c',
  })
  declare http?: boolean

  async run() {
    const codemods = await this.createCodemods()
    const stub = this.parsed.flags.http ? 'http' : 'main'
    const feature = this.parsed.flags.feature
      ? generators.createEntity(this.parsed.flags.feature)
      : {
          name: '',
          path: '',
        }

    await codemods.makeUsingStub(stubsRoot, `make/action/${stub}.stub`, {
      entity: generators.createEntity(this.name),
      feature,
    })
  }
}
