import React, { useState } from 'react';

const areStatesEqual = (state1, state2) => {
  return state1.every((value, index) => value === state2[index]);
};
const getPossibleMoves = (state) => {
  const blankIndex = state.indexOf(0);
  const moves = [];
  const directions = [-3, 3, -1, 1]; 

  directions.forEach(direction => {
    const newIndex = blankIndex + direction;
    if (
      newIndex >= 0 && newIndex < 9 &&
      !(blankIndex % 3 === 2 && direction === 1) && 
      !(blankIndex % 3 === 0 && direction === -1) 
    ) {
      const newState = [...state];
      [newState[blankIndex], newState[newIndex]] = [newState[newIndex], newState[blankIndex]];
      moves.push(newState);
    }
  });

  return moves;
};

// Manhattan distance heuristic
const manhattanDistance = (state, goalState) => {
  return state.reduce((sum, value, index) => {
    if (value !== 0) {
      const goalIndex = goalState.indexOf(value);
      const x1 = index % 3;
      const y1 = Math.floor(index / 3);
      const x2 = goalIndex % 3;
      const y2 = Math.floor(goalIndex / 3);
      return sum + Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    return sum;
  }, 0);
};

// A* algorithm
const aStar = (initialState, goalState) => {
  const startTime = performance.now();
  const openSet = [{ state: initialState, g: 0, f: 0, parent: null }];
  const closedSet = new Set();
  let nodesExplored = 0;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    nodesExplored++;

    if (areStatesEqual(current.state, goalState)) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift(node.state);
        node = node.parent;
      }
      const endTime = performance.now();
      return {
        path,
        nodesExplored,
        timeTaken: endTime - startTime,
      };
    }

    closedSet.add(current.state.toString());

    const moves = getPossibleMoves(current.state);
    for (const move of moves) {
      if (!closedSet.has(move.toString())) {
        const g = current.g + 1;
        const h = manhattanDistance(move, goalState);
        const f = g + h;

        const existing = openSet.find(node => areStatesEqual(node.state, move));
        if (!existing || g < existing.g) {
          if (existing) {
            openSet.splice(openSet.indexOf(existing), 1);
          }
          openSet.push({ state: move, g, f, parent: current });
        }
      }
    }
  }

  const endTime = performance.now();
  return { path: null, nodesExplored, timeTaken: endTime - startTime };
};

const EightPuzzle = () => {
  const [state, setState] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [solution, setSolution] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [performance, setPerformance] = useState(null);

  const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  const shuffle = () => {
    const newState = [...goalState];
    for (let i = newState.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newState[i], newState[j]] = [newState[j], newState[i]];
    }
    setState(newState);
    setSolution(null);
    setCurrentStep(0);
    setPerformance(null);
  };

  const solve = () => {
    const result = aStar(state, goalState);
    setSolution(result.path);
    setCurrentStep(0);
    setPerformance({
      nodesExplored: result.nodesExplored,
      timeTaken: result.timeTaken,
      pathLength: result.path ? result.path.length - 1 : 'N/A',
    });
  };

  const nextStep = () => {
    if (solution && currentStep < solution.length - 1) {
      setCurrentStep(currentStep + 1);
      setState(solution[currentStep + 1]);
    }
  };

  const prevStep = () => {
    if (solution && currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setState(solution[currentStep - 1]);
    }
  };

  const handleTileClick = (index) => {
    const blankIndex = state.indexOf(0);
    if (
      (Math.abs(index - blankIndex) === 1 && Math.floor(index / 3) === Math.floor(blankIndex / 3)) ||
      Math.abs(index - blankIndex) === 3
    ) {
      const newState = [...state];
      [newState[index], newState[blankIndex]] = [newState[blankIndex], newState[index]];
      setState(newState);
      setSolution(null);
      setCurrentStep(0);
      setPerformance(null);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={headerStyle}>8-Puzzle Game</h2>
        <div style={gridStyle}>
          {state.map((tile, index) => (
            <button
              key={index}
              style={{
                ...tileStyle,
                backgroundColor: tile === 0 ? '#e2e8f0' : '#3b82f6',
                color: tile === 0 ? 'transparent' : 'white',
              }}
              onClick={() => handleTileClick(index)}
            >
              {tile !== 0 && tile}
            </button>
          ))}
        </div>
        <div style={buttonContainerStyle}>
          <button onClick={shuffle} style={buttonStyle}>Shuffle</button>
          <button onClick={solve} style={buttonStyle}>Solve</button>
          {solution && (
            <>
              <button onClick={prevStep} disabled={currentStep === 0} style={buttonStyle}>
                Previous
              </button>
              <button onClick={nextStep} disabled={currentStep === solution.length - 1} style={buttonStyle}>
                Next
              </button>
            </>
          )}
        </div>
        {solution && (
          <p style={textStyle}>
            Solution found in {solution.length - 1} moves. Step {currentStep + 1} of {solution.length}
          </p>
        )}
        {performance && (
          <div style={performanceStyle}>
            <h3 style={subHeaderStyle}>Performance Analysis:</h3>
            <p style={textStyle}>Nodes Explored: {performance.nodesExplored}</p>
            <p style={textStyle}>Time Taken: {performance.timeTaken.toFixed(2)} ms</p>
            <p style={textStyle}>Solution Path Length: {performance.pathLength}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f4f8',
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: '2rem',
  maxWidth: '400px',
  width: '100%',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '1rem',
  color: '#2d3748',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const tileStyle = {
  width: '100%',
  aspectRatio: '1',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  backgroundColor: '#4b5563',
  color: 'white',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
};

const textStyle = {
  textAlign: 'center',
  marginBottom: '0.5rem',
  color: '#4a5568',
};

const performanceStyle = {
  marginTop: '1rem',
  padding: '1rem',
  backgroundColor: '#f7fafc',
  borderRadius: '0.25rem',
};

const subHeaderStyle = {
  fontSize: '1rem',
  marginBottom: '0.5rem',
  color: '#2d3748',
};

export default EightPuzzle;