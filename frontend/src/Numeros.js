import React, { useState, useEffect } from 'react';

import pajarito from '../src/images/pajarito.png';
import tortuga from '../src/images/tortuga.png';
import cerdito from '../src/images/cerdito.png';
import patito from '../src/images/patito.png';
import mariposa from '../src/images/mariposa.png';
import pollito from '../src/images/pollito.png';
import gatito from '../src/images/gatito.png';
import perrito from '../src/images/perrito.png';
import oveja from '../src/images/oveja.png';

const Numeros = ({ player, onBack, onConfigClick, onProgressUpdate }) => {
  //const [currentNumber, setCurrentNumber] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
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

  // Mensajes de felicitación aleatorios
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

  // Manejar la entrada del teclado
  const handleKeyPress = (e) => {
    if (showInstructions) return;
    
    // Solo permitir números
    if (!/[0-9]/.test(e.key)) return;
    
    setUserInput(e.key);
    checkAnswer(e.key);
  };

  /*
  // Comprobar la respuesta
  const checkAnswer = (input) => {
    const isRight = parseInt(input) === currentNumber;
    setIsCorrect(isRight);
    setShowFeedback(true);
    setAttempts(prev => prev + 1);

    if (isRight) {
      // Calcular progreso
      const progress = ((currentNumber + 1) / 10) * 100;
      
      // Guardar progreso actual en localStorage
      localStorage.setItem(`nivel1_numeros_progress_${player.name}`, currentNumber + 1);

      onProgressUpdate(progress, false);

      if (currentNumber === 9) {
        // Si es el último número, mostrar pantalla de completado
        
        //localStorage.removeItem(`nivel1_numeros_progress_${player.name}`);
        localStorage.setItem(`nivel1_numeros_progress_${player.name}`, '10'); 
        onProgressUpdate(100, true);

        setTimeout(() => {
          setGameCompleted(true);
          setShowFeedback(false);
        }, 2000);
      } else {
        // Si no es el último, continuar al siguiente número
        setTimeout(() => {
          setCurrentNumber(prev => prev + 1);
          setShowFeedback(false);
          setUserInput('');
          setAttempts(0);
        }, 2000);
      }
    }
  };
  */

  const saveDetailsToDatabase = async (updatedDetails) => {  
    try {
      const response = await fetch('http://localhost:5000/api/game-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: player.name,
          details: updatedDetails, // Enviamos solo el estado actual, no acumulado
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Advertencia al guardar detalles:', errorData);
        return; // Detén aquí si no es un error crítico
      }
    } catch (error) {
      console.error('Error al guardar detalles:', error);
    }
  };
  
  const checkAnswer = (input) => {
    const isRight = parseInt(input) === currentNumber;
    setIsCorrect(isRight);
    setShowFeedback(true);
  
    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000; // Tiempo en segundos
  
    // Actualizar los detalles de la respuesta actual
    setDetailsByNumber((prevDetails) => {
      const updatedDetails = { ...prevDetails };
  
      // Asegúrate de inicializar los detalles correctamente
      if (!updatedDetails[currentNumber]) {
        updatedDetails[currentNumber] = { errors: 0, time: 0 };
      }
  
      updatedDetails[currentNumber] = {
        ...updatedDetails[currentNumber],
        time: responseTime, // Sobreescribe el tiempo en vez de acumular
        errors: isRight ? updatedDetails[currentNumber].errors : updatedDetails[currentNumber].errors + 1, // Incrementa solo si es incorrecto
      };
  
      // Envía los detalles al backend
      saveDetailsToDatabase({ [currentNumber]: updatedDetails[currentNumber] });
  
      return updatedDetails;
    });
  
    if (!isRight) {
      console.log('Respuesta incorrecta');
      return;
    }
  
    // Actualizar progreso si la respuesta es correcta
    const progress = ((currentNumber + 1) / 10) * 100;
    localStorage.setItem(
      `nivel1_numeros_progress_${player.name}`,
      currentNumber + 1
    );
    onProgressUpdate(progress, false);
  
    // Finalizar o pasar al siguiente número
    if (currentNumber === 9) {
      localStorage.setItem(`nivel1_numeros_progress_${player.name}`, '10');
      onProgressUpdate(100, true);
      showFinalStats();
      setTimeout(() => {
        setGameCompleted(true);
        setShowFeedback(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setCurrentNumber((prev) => prev + 1);
        setShowFeedback(false);
        setUserInput('');
        setAttempts(0);
        setStartTime(Date.now()); // Reiniciar el tiempo de inicio
      }, 2000);
    }
  };
  
  const showFinalStats = () => {
    let totalErrors = 0;
    let totalTime = 0;
  
    errorsArray.forEach((errors, index) => {
      const time = responseTimes[index] || 0; // Tiempo de respuesta para este número
      totalErrors += errors;
      totalTime += time;
      console.log(
        `Número: ${index} | Errores: ${errors} | Tiempo de respuesta: ${time.toFixed(2)}s`
      );
    });
  
    console.log(`Errores totales: ${totalErrors}`);
    console.log(`Tiempo total: ${totalTime.toFixed(2)}s`);
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

  // Modificar el método de instrucciones para guardar estado
  const startGame = () => {
    setShowInstructions(false);
    localStorage.setItem(`nivel1_numeros_instructions_${player.name}`, 'started');
  };

   // Modificar el método onBack para limpiar el progreso si se completa
   const handleBack = () => {
    onBack();
  };

  // Configurar el event listener del teclado
  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentNumber, showInstructions]);

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
        

        {showInstructions ? (
          // Pantalla de instrucciones
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-purple-600">
              ¡Vamos a aprender los números! 🎯
            </h2>
            <p className="text-xl text-gray-600">
              Busca la tarjeta con el número que te pida y digítalo en el teclado.
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Numeros;