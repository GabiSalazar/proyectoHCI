import React, { useState, useEffect } from 'react';

// Importación de imágenes
import pajarito from '../src/images/pajarito.png';
import tortuga from '../src/images/tortuga.png';
import cerdito from '../src/images/cerdito.png';
import patito from '../src/images/patito.png';
import mariposa from '../src/images/mariposa.png';
import pollito from '../src/images/pollito.png';
import gatito from '../src/images/gatito.png';
import perrito from '../src/images/perrito.png';
import oveja from '../src/images/oveja.png';

import numero0 from '../src/images/numero0.png';
import numero1 from '../src/images/numero1.png';
import numero2 from '../src/images/numero2.png';
import numero3 from '../src/images/numero3.png';
import numero4 from '../src/images/numero4.png';
import numero5 from '../src/images/numero5.png';
import numero6 from '../src/images/numero6.png';
import numero7 from '../src/images/numero7.png';
import numero8 from '../src/images/numero8.png';
import numero9 from '../src/images/numero9.png';


// Objeto para mapear números con nombres 
const numberNames = {
  0: 'cero',
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
};

// Objeto para mapear números con sus imágenes
const solutionImages = {
  0: numero0,
  1: numero1,
  2: numero2,
  3: numero3,
  4: numero4,
  5: numero5,
  6: numero6,
  7: numero7,
  8: numero8,
  9: numero9
};

// Componente principal del juego
const Numeros = ({ player, onBack, onConfigClick, onProgressUpdate }) => {
  
  // Estados del componente
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailsByNumber, setDetailsByNumber] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [errorsArray, setErrorsArray] = useState(new Array(10).fill(0));
  const [startTime, setStartTime] = useState(Date.now()); // Para rastrear el inicio de cada intento
  const [responseTimes, setResponseTimes] = useState([]); // Array para almacenar los tiempos de respuesta

  const [currentNumber, setCurrentNumber] = useState(() => {
    const savedProgress = localStorage.getItem(`nivel1_numeros_progress_${player.name}`);
    return savedProgress ? parseInt(savedProgress) : 0;
  });

  //Mostrar temporizador
  const [timeLeft, setTimeLeft] = useState(10); // 10 segundos por fase

  // Mostrar solución
  const [showSolution, setShowSolution] = useState(false);
  
  // Mensajes de felicitación
  const successMessages = [
    "¡Excelente trabajo! 🌟",
    "¡Lo lograste! ¡Eres increíble! ⭐",
    "¡Muy bien! ¡Sigue así! 🎉",
    "¡Fantástico! ¡Eres muy inteligente! 🏆",
    "¡Genial! ¡Lo hiciste perfectamente! 🌈"
  ];

  // Mensajes de ánimo para intentos incorrectos
  const encouragementMessages = [
    "¡Casi lo tienes! Intenta de nuevo 💪",
    "¡Sigue intentando! Tú puedes 🌟",
    "¡No te rindas! Estás muy cerca ⭐",
    "¡Vamos a intentarlo una vez más! 🎈"
  ];

  // Configuración de los animales que acompañan cada número
  const animalesConfig = {
    1: { imagen: pajarito, cantidad: 1, nombre: 'pajarito' },
    2: { imagen: tortuga, cantidad: 2, nombre: 'tortuga' },
    3: { imagen: cerdito, cantidad: 3, nombre: 'cerdito' },
    4: { imagen: patito, cantidad: 4, nombre: 'patito' },
    5: { imagen: mariposa, cantidad: 5, nombre: 'mariposa' },
    6: { imagen: pollito, cantidad: 6, nombre: 'pollito' },
    7: { imagen: gatito, cantidad: 7, nombre: 'gatito' },
    8: { imagen: perrito, cantidad: 8, nombre: 'perrito' },
    9: { imagen: oveja, cantidad: 9, nombre: 'oveja' }
  };

  // Maneja la entrada de teclado
  const handleKeyPress = (e) => {
    if (showInstructions) return;
    
    // Solo permitir números
    if (!/[0-9]/.test(e.key)) return;
    
    setUserInput(e.key);
    checkAnswer(e.key);
  };

  const saveDetailsToDatabase = async ({ section, details }) => {
    console.log('Datos que se enviarán al backend:', { section, details });
  
    try {
      const response = await fetch('http://localhost:5000/api/game-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: player.name,
          section,
          details,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Advertencia al guardar detalles:', errorData);
        return; // Detén aquí si no es un error crítico
      }
  
      console.log('Detalles guardados correctamente en la base de datos');
    } catch (error) {
      console.error('Error al guardar detalles:', error);
    }
  };  
  
  // Verifica la respuesta del usuario
  const checkAnswer = (input) => {
    // Si ya hay una transición en progreso, no hacer nada
    if (showFeedback || showSolution || showInstructions || gameCompleted) return;

    const isRight = parseInt(input) === currentNumber;
    setIsCorrect(isRight);
    setShowFeedback(true);
  
    const endTime = Date.now();
    //const responseTime = (endTime - startTime) / 1000;
    const responseTime = Math.min((endTime - startTime) / 1000, 10); // Limitamos el tiempo máximo a 10 segundos

    const currentNumberName = numberNames[currentNumber];

    // Si la respuesta es incorrecta
    if (!isRight) {
        // Actualizamos el contador de errores en las estadísticas
        setDetailsByNumber((prevDetails) => {
            const updatedDetails = { ...prevDetails };
            
            if (!updatedDetails[currentNumberName]) {
                updatedDetails[currentNumberName] = { errors: 0, time: 0, resultado: false};
            }
            
            updatedDetails[currentNumberName] = {
                ...updatedDetails[currentNumberName],
                errors: updatedDetails[currentNumberName].errors + 1,
                resultado: false  // Indicamos que no acertó
            };

            // Guardar los detalles en el backend y mostrar en consola
            const details = { [currentNumberName]: updatedDetails[currentNumberName] };
            saveDetailsToDatabase({
                section: 'numbers',
                details: details,
            });

            console.log('Detalles actualizados para', currentNumberName, ':', details[currentNumberName]);

            return updatedDetails;
        });

        // Solo resetear después de 1 segundo
        const feedbackTimeout = setTimeout(() => {
          setShowFeedback(false);
          setUserInput('');
      }, 1000);

      return () => clearTimeout(feedbackTimeout);
    }

    // Si la respuesta es correcta
    const progress = ((currentNumber + 1) / 10) * 100;
    localStorage.setItem(`nivel1_numeros_progress_${player.name}`, currentNumber + 1);
    onProgressUpdate(progress, false);

    // Guardamos los detalles de tiempo para respuesta correcta
    setDetailsByNumber((prevDetails) => {
        const updatedDetails = { ...prevDetails };

        if (!updatedDetails[currentNumberName]) {
            updatedDetails[currentNumberName] = { errors: 0, time: 0, resultado: true};
        }

        updatedDetails[currentNumberName] = {
            ...updatedDetails[currentNumberName],
            time: responseTime,
            resultado: true 
        };

        // Guardar los detalles en el backend y mostrar en consola
        const details = { [currentNumberName]: updatedDetails[currentNumberName] };
        saveDetailsToDatabase({
            section: 'numbers',
            details: details,
        });
        console.log('Detalles actualizados para', currentNumberName, ':', details[currentNumberName]);
        return updatedDetails;
    });

    if (currentNumber >= 9) {
      localStorage.setItem(`nivel1_numeros_progress_${player.name}`, '10');
      onProgressUpdate(100, true);

      const completionTimeout = setTimeout(() => {
          setGameCompleted(true);
          setShowFeedback(false);
      }, 2000);

      return () => clearTimeout(completionTimeout);
    } else {
        
        const transitionTimeout = setTimeout(() => {
            //setCurrentNumber(current => current + 1); // Solo incrementa 1
            setCurrentNumber(currentNumber + 1);
            setShowFeedback(false);
            setUserInput('');
            setStartTime(Date.now());
            setTimeLeft(10);
        }, 2000);

        return () => clearTimeout(transitionTimeout);
    }
};
  // Función para ordenar los datos basados en el orden de los números
  const getSortedDetails = (details) => {
    const order = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    return Object.keys(details)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .reduce((sorted, key) => {
        sorted[key] = details[key];
        return sorted;
      }, {});
  };

  // Mostrar estadísticas finales con los datos ordenados
  const showFinalStats = () => {
    let totalErrors = 0;
    let totalTime = 0;
    let aciertos = 0;

    // Ordenar los detalles antes de procesarlos
    const sortedDetails = getSortedDetails(detailsByNumber);

    Object.keys(sortedDetails).forEach((key) => {
      const { errors, time, resultado } = sortedDetails[key];
      totalErrors += errors;
      totalTime += time;
      if (resultado) aciertos++;
        console.log(
            `Número: ${key} | Errores: ${errors} | Tiempo: ${time.toFixed(2)}s | Acertó: ${resultado ? 'Sí' : 'No'}`
        );
    });

    console.log(`Errores totales: ${totalErrors}`);
    console.log(`Tiempo total: ${totalTime.toFixed(2)}s`);
    console.log(`Aciertos totales: ${aciertos}/10`);
  };
  
  // Al montar el componente, restaurar estado de instrucciones
  useEffect(() => {
    const savedProgress = localStorage.getItem(`nivel1_numeros_progress_${player.name}`);
    const savedInstructions = localStorage.getItem(`nivel1_numeros_instructions_${player.name}`);
    
    if (savedProgress === '10') {
      setGameCompleted(true);
      onProgressUpdate(100, true);
    }
    
    if (savedInstructions) {
      setShowInstructions(false);
    }
  }, []);

  // Maneja la lógica del temporizador
  useEffect(() => {
    // Si estamos en instrucciones o el juego está completado, no hacer nada
    if (showInstructions || gameCompleted || showSolution) return;

    let timeoutId;
    const timerId = setInterval(() => {
        setTimeLeft(time => {
            // Si el tiempo llega a 0
            if (time <= 0) {
                clearInterval(timerId);
                setShowSolution(true);
                
                // Actualizar detalles cuando se acaba el tiempo
                const currentNumberName = numberNames[currentNumber];
                setDetailsByNumber((prevDetails) => {
                    const updatedDetails = { ...prevDetails };
                    
                    if (!updatedDetails[currentNumberName]) {
                        updatedDetails[currentNumberName] = { errors: 0, time: 10, resultado: false };
                    }
                    
                    updatedDetails[currentNumberName] = {
                        ...updatedDetails[currentNumberName],
                        time: 10,
                        resultado: false
                    };

                    // Guardar los detalles en el backend y mostrar en consola
                    const details = { [currentNumberName]: updatedDetails[currentNumberName] };
                    saveDetailsToDatabase({
                        section: 'numbers',
                        details: details,
                    });
                    console.log('Tiempo agotado para', currentNumberName, ':', details[currentNumberName]);

                    return updatedDetails;
                });
                
                // Configurar el timeout para la transición
                timeoutId = setTimeout(() => {
                    setShowSolution(false);
                    
                    if (currentNumber < 9) {
                        setCurrentNumber(prev => prev + 1);
                        setTimeLeft(10);
                        setStartTime(Date.now());
                    } else {
                        localStorage.setItem(`nivel1_numeros_progress_${player.name}`, '10');
                        onProgressUpdate(100, true);
                        setGameCompleted(true);
                    }
                }, 2000);
                
                return 0;
            }
            return time - 1;
        });
    }, 1000);

    // Limpieza
    return () => {
        if (timerId) clearInterval(timerId);
        if (timeoutId) clearTimeout(timeoutId);
    };
}, [currentNumber, showInstructions, gameCompleted, showSolution, player.name]);

  // Dependencia en handleKeyPress
  useEffect(() => {
    const handler = (e) => {
        if (showInstructions || gameCompleted || showSolution || showFeedback) return;
        if (!/[0-9]/.test(e.key)) return;
        
        setUserInput(e.key);
        checkAnswer(e.key);
    };

    window.addEventListener('keypress', handler);
    return () => window.removeEventListener('keypress', handler);
  }, [currentNumber, showInstructions, gameCompleted, showSolution, showFeedback]);



  // Inicia el juego y oculta las instrucciones
  const startGame = () => {
    setShowInstructions(false);
    localStorage.setItem(`nivel1_numeros_instructions_${player.name}`, 'started');
  };

   // Función para volver al menú anterior
   const handleBack = () => {
    onBack();
  };

    // Renderizado del componente
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 p-6">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <button
                className="bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold py-2 px-4
                        rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={handleBack}
            >
                ← Volver
            </button>
            
            <div 
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-all duration-300"
                onClick={onConfigClick}
            >
                <span className="text-4xl">{player?.avatar}</span>
                <span className="text-2xl font-bold text-purple-600 hover:text-purple-700">
                {player?.name}
                </span>
            </div>
        </div>
        
        {!showInstructions && !gameCompleted && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg relative">
              {/* Título del nivel */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 
                          bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                          px-6 py-2 rounded-full shadow-lg">
                <span className="text-lg font-bold">Números</span>
              </div>

              {/* Fases */}
              <div className="flex justify-between items-center gap-3 mt-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex-1">
                    <div className="relative">
                      {i < 9 && (
                        <div className={`absolute top-1/2 left-[60%] right-0 h-2 rounded-full
                                    ${i < currentNumber 
                                      ? 'bg-gradient-to-r from-green-400 to-green-500' 
                                      : 'bg-gray-200'}`}>
                        </div>
                      )}
                      
                      <div className={`relative z-10 flex flex-col items-center transform 
                                  transition-all duration-500 ${
                                    i === currentNumber ? 'scale-110' : 'hover:scale-105'
                                  }`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                                    shadow-lg transition-all duration-300 border-4
                                    ${i === currentNumber
                                      ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200 animate-pulse'
                                      : i < currentNumber
                                      ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-200'
                                      : 'bg-white border-gray-100'
                                    }`}>
                          <span className={`text-2xl font-bold ${
                            i === currentNumber
                              ? 'text-yellow-900'
                              : i < currentNumber
                              ? 'text-white'
                              : 'text-gray-400'
                          }`}>
                            {i}
                          </span>
                        </div>
                        
                        {i === currentNumber && (
                          <div className="absolute -bottom-6">
                            <span className="text-yellow-500 text-2xl animate-bounce">⭐</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Barra de progreso */}
              <div className="mt-12">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-purple-700">
                    Tu Progreso
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">
                      {(currentNumber / 9 * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 
                            transition-all duration-1000 relative"
                    style={{ width: `${(currentNumber / 9) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="w-full h-full animate-shimmer 
                                  bg-gradient-to-r from-transparent via-white to-transparent"
                          style={{ backgroundSize: '200% 100%' }}>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInstructions ? (
          // Pantalla de instrucciones
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-purple-600">
              ¡Vamos a aprender los números! 🎯
            </h2>
            <p className="text-xl text-gray-600">
              Inserta la tarjeta del número que ves en pantalla.
            </p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-8
                       rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
              onClick={startGame}
            >
              ¡Empezar! 🚀
            </button>
          </div>
          
        ) : gameCompleted ? (
            // Nueva pantalla de juego completado
          <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-purple-600 mb-8">
            ¡Felicitaciones! 🎉
          </h2>
          <div className="text-9xl mb-8">🏆</div>
          <p className="text-2xl text-gray-600 mb-8">
            ¡Has completado todos los números!
          </p>
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-8
                   rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={onBack}
          >
            Volver al menú
          </button>
        </div>
      ): (
          // Pantalla del juego
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-purple-600 mb-8">
              Encuentra el número:
            </h2>
            
            {/* Número actual
            <div className="text-[250px] font-bold text-blue-500 animate-bounce">
              {currentNumber}
            </div>
            */}

            {/* Número con animales animados */}
            <div className="flex flex-col items-center">
              {/* Número */}
              <div className="text-[250px] font-bold text-blue-500 animate-bounce">
                {currentNumber}
              </div>
              
              {/* Contenedor de animales */}
              {animalesConfig[currentNumber] && (
                <div className="flex flex-nowrap justify-center gap-4 mt-4 max-w-3xl mx-auto">
                  {Array(animalesConfig[currentNumber].cantidad).fill(0).map((_, index) => (
                    <img 
                      key={index}
                      src={animalesConfig[currentNumber].imagen}
                      alt={`${animalesConfig[currentNumber].nombre} ${index + 1}`}
                      className={`w-23 h-20 object-contain animate-bounce`}
                      style={{ 
                        animationDelay: `${index * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {showSolution && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-xl p-6 shadow-2xl transform transition-all">
                  <h3 className="text-2xl font-bold text-purple-600 mb-4">
                    ¡Se acabó el tiempo!
                  </h3>
                  <p className="text-xl text-gray-600 mb-4">
                    La respuesta correcta era:
                  </p>
                  <img 
                    src={solutionImages[currentNumber]}
                    alt={`Solución: número ${currentNumber}`}
                    className="w-96 h-96 object-contain mx-auto mb-4"
                  />
                </div>
              </div>
            )}
            
            {/*text-9xl*/}
            {/* Mensaje de instrucción */}
            <p className="text-2xl text-gray-600">
              Inserta la tarjeta del número {currentNumber}
            </p>

            {/* Retroalimentación */}
            {showFeedback && (
              <div className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} 
                            animate-bounce`}>
                {isCorrect 
                  ? successMessages[Math.floor(Math.random() * successMessages.length)]
                  : encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]}
              </div>
            )}

            {/* Indicador visual de entrada */}
            <div className="mt-8 text-gray-500">
              Tu respuesta: <span className="text-3xl font-bold">{userInput}</span>
            </div>

            {!showInstructions && !gameCompleted && (
              <div className="absolute bottom-8 right-8">
                <div className={`relative group transform transition-all duration-300 ${
                  timeLeft <= 3 ? 'scale-110' : 'hover:scale-105'
                }`}>
                  <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg
                              relative overflow-hidden ${timeLeft <= 3 ? 'animate-pulse' : ''}`}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={timeLeft <= 3 ? '#FEE2E2' : '#E0E7FF'}
                        strokeWidth="8"
                        className="opacity-30"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={timeLeft <= 3 ? '#EF4444' : '#3B82F6'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - timeLeft/10)}
                        className="transition-all duration-1000"
                      />
                    </svg>

                    <div className={`relative z-10 text-4xl font-bold 
                                ${timeLeft <= 3 ? 'text-red-500' : 'text-blue-500'}`}>
                      {timeLeft}
                    </div>

                    {timeLeft <= 3 && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full 
                                    flex items-center justify-center animate-bounce shadow-lg">
                          <span className="text-white text-xs">⚠️</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
  }
`;
document.head.appendChild(style);

export default Numeros;