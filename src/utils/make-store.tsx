import React from "react";

type ReturnArray<StateType, ActionType> = [
  React.FC,
  () => StateType,
  () => React.Dispatch<ActionType>
];

export default function makeStore<StateType, ActionType>(
  reducer: React.Reducer<StateType, ActionType>,
  initialState: StateType
): ReturnArray<StateType, ActionType> {
  const storeContext = React.createContext<StateType>(initialState);
  const dispatchContext = React.createContext<React.Dispatch<ActionType>>(
    {} as React.Dispatch<ActionType>
  );

  const StoreProvider: React.FC = ({ children }) => {
    const [store, dispatch] = React.useReducer(reducer, initialState);

    return (
      <dispatchContext.Provider value={dispatch}>
        <storeContext.Provider value={store}>{children}</storeContext.Provider>
      </dispatchContext.Provider>
    );
  };

  const useStore = () => React.useContext(storeContext);

  const useDispatch = () => React.useContext(dispatchContext);

  return [StoreProvider, useStore, useDispatch];
}
