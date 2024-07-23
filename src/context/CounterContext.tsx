import { createContext, useReducer, ChangeEvent, ReactElement, useCallback, useContext } from 'react'


// Typescript for the initState const
type StateType = {
    count: number,
    text: string,
}

//creating the object where the states are stored. As a reducer is being used these values are held all together in an object. (state is initialised below with the initContextState function)
export const initState: StateType = { count: 0, text: '' }


// enum class is declared with 3 constants as arguments to the class constructor.
const enum REDUCER_ACTION_TYPE {
    INCREMENT,
    DECREMENT,
    NEW_INPUT
}
// An enum is a special type that represents a group of constants (unchangeable values).
//  To create an enum, use the enum keyword, followed by the name of the enum, and 
//  separate the enum items with a comma: enum Level {
// (controversial apparently and some say that they should never be used)

// the Typescript type of ReducerAction is defined which will always include one of the actions described in the enum above and, if it is changing the input text may include a string
type ReducerAction = {
    type: REDUCER_ACTION_TYPE, 
    payload?: string,
}

// creation of the reducer which holds the code on updating state. 
const reducer = (state: StateType, action: ReducerAction): typeof initState => {
    switch (action.type) {
        case REDUCER_ACTION_TYPE.INCREMENT:
            return { ...state, count: state.count + 1} //important to spread in state object each time otherwise all states (held in the initState object will be reset any time a state is updated. 
        case REDUCER_ACTION_TYPE.DECREMENT:
            return { ...state, count: state.count - 1} 
        case REDUCER_ACTION_TYPE.NEW_INPUT:
            return { ...state, text: action.payload ?? "" } // The nullish coalescing (??) operator is a logical operator that returns its right-hand side operand when its left-hand side operand is null  
        default: 
            throw new Error()
    }
}

//Custom Hook

// the following hook uses a useReducer to dispatch the correct parameters to the reducer function above in order to update the state
//the useCallback function avoid having to re-write this code in the Counter componenent when calling the individual functions (no dependency simply [] as the useCallback functions are called on button clicks)
const useCounterContext = (initState: StateType) => {
    const [state, dispatch] = useReducer(reducer, initState)

    const increment = useCallback(() => dispatch({ type: REDUCER_ACTION_TYPE.INCREMENT }), [])
    const decrement = useCallback(() => dispatch({ type: REDUCER_ACTION_TYPE.DECREMENT }), [])
    const handleTextInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        dispatch({ 
            type: REDUCER_ACTION_TYPE.NEW_INPUT,
            payload: e.target.value
        })
    }, [])

    return {state, increment, decrement, handleTextInput}

}

// useReducer()
// const [state, dispatch] = useReducer(reducer, initialArg, init?)
// Parameters 
// reducer: The reducer function that specifies how the state gets updated. It must be pure, should take the state and action as arguments, and should return the next state. State and action can be of any types.
// initialArg: The value from which the initial state is calculated. It can be a value of any type. How the initial state is calculated from it depends on the next init argument.
// optional init: The initializer function that should return the initial state. If it’s not specified, the initial state is set to initialArg. Otherwise, the initial state is set to the result of calling init(initialArg).
// Returns 
// useReducer returns an array with exactly two values:

// The current state. During the first render, it’s set to init(initialArg) or initialArg (if there’s no init).
// The dispatch function that lets you update the state to a different value and trigger a re-render.
// Caveats 
// useReducer is a Hook, so you can only call it at the top level of your component or your own Hooks. You can’t call it inside loops or conditions. If you need that, extract a new component and move the state into it.


type UseCounterContextType = ReturnType<typeof useCounterContext> // ReturnType utility prevents having to type all of the data types (hover over useCounterContext to see what the interface is)

const initContextState: UseCounterContextType = {
    state: initState,
    increment: () => {},
    decrement: () => {},
    handleTextInput: (e: ChangeEvent<HTMLInputElement>) => {},
} //this is initializing the values in state object initState

export const CounterContext = createContext<UseCounterContextType>(initContextState)


//always need a provider which will provide the props to the relevant components
// children are whats inbetween the opening and closing tags of the component

type ChildrenType = {
    children?: ReactElement | undefined
}

export const CounterProvider = ({ children, ...initState}: ChildrenType & StateType): ReactElement  => {
    return (
        <CounterContext.Provider value={useCounterContext(initState)} >
            {children}
        </CounterContext.Provider>
    )
}

// the function uses rest parameters and children has to be first and initState second. 
// the children (the other react elements that will be nested in the <CounterContext.Provider>) cannot be implicit.
// So if i have properly understood this is something of a standard syntax for React using Typescript when creating the context API ProviderElement. 
// Type "ReactElement" which needs to be imported from React and then {children} nested in the Provider.   


// these last two type / const couples export the props created in this file using "useContext" so they can be availble for those components where they are imported.
// creating custom hooks here in the CounterContext file but these could be created in a different "Custom Hooks folder" if the project was larger.

type UseCounterHookType = {
    count: number, 
    increment: () => void,
    decrement: () => void,
}

export const useCounter = (): UseCounterHookType => {
    const { state: {count}, increment, decrement } = useContext(CounterContext)

    return { count, increment, decrement }
}

type UseCounterTextHookType = {
    text: string,
    handleTextInput: (e: ChangeEvent<HTMLInputElement>) => void,
}

export const useCounterText = (): UseCounterTextHookType => {
    const { state: { text }, handleTextInput } = useContext(CounterContext)
    return { text, handleTextInput }
}