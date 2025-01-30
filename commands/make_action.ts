import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { generators } from '@adonisjs/core/app'
import { stubsRoot } from '../stubs/main.js'
import string from '@adonisjs/core/helpers/string'

type Entity = {
  name: string
  path: string
}

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
    description: 'Create resourceful actions within a feature folder; get, store, update, destroy',
    showNegatedVariantInHelp: true,
    alias: 'r',
  })
  declare resource?: boolean

  @flags.boolean({
    description: 'Inject HTTP Context into the action',
    showNegatedVariantInHelp: true,
    alias: 'c',
  })
  declare http?: boolean

  async run() {
    const codemods = await this.createCodemods()
    const stub = this.parsed.flags.http ? 'main_http' : 'main'
    const isResourceful = this.parsed.flags.resource
    const entity = generators.createEntity(this.name)
    const feature =
      this.parsed.flags.feature && !isResourceful
        ? generators.createEntity(this.parsed.flags.feature)
        : {
            name: '',
            path: '',
          }

    if (!isResourceful) {
      await codemods.makeUsingStub(stubsRoot, `make/action/${stub}.stub`, { entity, feature })
      return
    }

    const entities = this.#getResourcefulEntities(entity)

    for (const item of entities) {
      let itemStub = stub.replace('main', item.stub)
      await codemods.makeUsingStub(stubsRoot, `make/action/${itemStub}.stub`, {
        entity: item.entity,
        feature,
      })
    }
  }

  #getResourcefulEntities(entity: Entity) {
    const singularName = string.singular(entity.name)
    const pluralName = string.plural(entity.name)
    const folder = `${entity.path}/${pluralName}`
    return [
      { stub: 'resource', entity: generators.createEntity(`${folder}/get_${singularName}`) },
      { stub: 'main', entity: generators.createEntity(`${folder}/get_${pluralName}`) },
      { stub: 'resource', entity: generators.createEntity(`${folder}/store_${singularName}`) },
      { stub: 'resource', entity: generators.createEntity(`${folder}/update_${singularName}`) },
      { stub: 'resource', entity: generators.createEntity(`${folder}/destroy_${singularName}`) },
    ]
  }
}
