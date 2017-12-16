import { describe, it } from 'mocha'
import { assert } from 'chai'

import hasLoadedTopic from 'modules/categories/reducers/has-loaded-category'

import { UPDATE_HAS_LOADED_TOPIC } from 'modules/categories/actions/update-has-loaded-category'

describe('modules/categories/reducers/has-loaded-category.js', () => {
  const test = (t) => {
    it(t.describe, () => {
      t.assertions()
    })
  }

  test({
    describe: 'should return the default value',
    assertions: () => {
      const actual = hasLoadedTopic(undefined, { type: null })

      const expected = {}

      assert.deepEqual(actual, expected, `Didn't return the expected default value`)
    }
  })

  test({
    describe: 'should return the existing value',
    assertions: () => {
      const actual = hasLoadedTopic({ topic: true }, { type: null })

      const expected = { topic: true }

      assert.deepEqual(actual, expected, `Didn't return the expected existing value`)
    }
  })

  test({
    describe: 'should return the updated value',
    assertions: () => {
      const actual = hasLoadedTopic({ topic: true }, {
        type: UPDATE_HAS_LOADED_TOPIC,
        hasLoadedTopic: {
          topic: false,
          topic2: true
        }
      })

      const expected = {
        topic: false,
        topic2: true
      }

      assert.deepEqual(actual, expected, `Didn't return the expected updated value`)
    }
  })
})
