/**
 * Provides the connection between an action object and a reducer handler. Handlers are provided first
 * so it can be curried more easily. Handlers use action types as keys, and connect to a function that takes a state
 * at the end of the parameter list and returns a state.
 */
export const createHandlers = () => {
  const handlers = {}

  return {
    // MUTATES
    registerHandler: (actionType, handler) => handlers[actionType] = handler,
    createReducer: (defaultState) => (state, { type, ...args }) => {
      const handler = handlers[type]

      if (!handler) return state || defaultState

      // This is safe for empty args, the spread will still come out to be [state], not [null, state]
      return handler(...Object.values(args), state)
    },
  }
}
