import React, { useState, useEffect } from 'react';

const Vocales = ({ player, onBack, onConfigClick, onProgressUpdate }) => {
  const vocales = ['a', 'e', 'i', 'o', 'u'];
  //const [currentVocal, setCurrentVocal] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  //const [showInstructions, setShowInstructions] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);

  const [errorsArray, setErrorsArray] = useState(new Array(vocales.length).fill(0));

  const [startTime, setStartTime] = useState(Date.now()); // Tiempo de inicio para cada intento
  const [responseTimes, setResponseTimes] = useState([]); // Array para almacenar los tiempos de respuesta


  // Estado inicial de currentVocal para recuperar progreso
  const [currentVocal, setCurrentVocal] = useState(() => {
    const savedProgress = localStorage.getItem(`nivel1_vocales_progress_${player.name}`);
    return savedProgress ? parseInt(savedProgress) : 0;
  });

  // Estado de instrucciones para recuperar
  const [showInstructions, setShowInstructions] = useState(() => {
    const savedInstructions = localStorage.getItem(`nivel1_vocales_instructions_${player.name}`);
    return !savedInstructions;
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

  // Manejar la entrada del teclado
  const handleKeyPress = (e) => {
    if (showInstructions) return;
    
    // Solo permitir vocales
    if (!/[aeiou]/i.test(e.key)) return;
    //if (!/^[a-zA-Z]$/.test(e.key)) return;
    
    setUserInput(e.key.toLowerCase());
    checkAnswer(e.key.toLowerCase());
  };

  // Verificar si el juego está completado al cargar
  useEffect(() => {
    const savedProgress = localStorage.getItem(`nivel1_vocales_progress_${player.name}`);
    const savedInstructions = localStorage.getItem(`nivel1_vocales_instructions_${player.name}`);
    
    if (savedProgress === '5') {
      setGameCompleted(true);
      onProgressUpdate(100, true);
    }
    
    if (savedInstructions) {
      setShowInstructions(false);
    }
  }, []);

  /*
  // Comprobar la respuesta
  const checkAnswer = (input) => {
    
    const isRight = input === vocales[currentVocal];
    setIsCorrect(isRight);
    setShowFeedback(true);
    setAttempts(prev => prev + 1);

    if (isRight) {

      // Calcular progreso
      const progress = ((currentVocal + 1) / vocales.length) * 100;
      
      // Guardar progreso en localStorage
      localStorage.setItem(`nivel1_vocales_progress_${player.name}`, currentVocal + 1);

      // Comunicar progreso
      onProgressUpdate(progress, false);

      if (currentVocal === vocales.length - 1) {
        // Si es la última vocal, mostrar pantalla de completado
        localStorage.setItem(`nivel1_vocales_progress_${player.name}`, '5'); 
        onProgressUpdate(100, true);

        setTimeout(() => {
          setGameCompleted(true);
          setShowFeedback(false);
        }, 2000);
      } else {
        // Si no es la última, continuar a la siguiente vocal
        setTimeout(() => {
          setCurrentVocal(prev => prev + 1);
          setShowFeedback(false);
          setUserInput('');
          setAttempts(0);
        }, 2000);
      }
    }
  };
  */

  const checkAnswer = (input) => {
    const isRight = input === vocales[currentVocal];
    setIsCorrect(isRight);
    setShowFeedback(true);
  
    // Calcular el tiempo de respuesta
    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000; // Convertir a segundos
  
    // Registrar el tiempo de respuesta
    setResponseTimes((prevTimes) => [...prevTimes, responseTime]);
  
    if (!isRight) {
      setErrorsArray((prevErrors) => {
        const updatedErrors = [...prevErrors];
        updatedErrors[currentVocal] += 1;
        return updatedErrors;
      });
  
      const randomEncouragement =
        encouragementMessages[
          Math.floor(Math.random() * encouragementMessages.length)
        ];
      //console.log(randomEncouragement);
      console.log("Error");
  
      return;
    }
  
    const progress = ((currentVocal + 1) / vocales.length) * 100;
    localStorage.setItem(
      `nivel1_vocales_progress_${player.name}`,
      currentVocal + 1
    );
    onProgressUpdate(progress, false);
  
    if (currentVocal === vocales.length - 1) {
      localStorage.setItem(`nivel1_vocales_progress_${player.name}`, '5');
      onProgressUpdate(100, true);
  
      showFinalStats();
  
      setTimeout(() => {
        setGameCompleted(true);
        setShowFeedback(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setCurrentVocal((prev) => prev + 1);
        setShowFeedback(false);
        setUserInput('');
        setAttempts(0);
        setStartTime(Date.now()); // Reiniciar el tiempo de inicio para la siguiente vocal
      }, 2000);
    }
  };
  
  const showFinalStats = () => {
    let totalErrors = 0;
    let totalTime = 0;
  
    errorsArray.forEach((errors, index) => {
      const time = responseTimes[index] || 0; // Tiempo de respuesta para la vocal
      totalErrors += errors;
      totalTime += time;
      console.log(
        `Vocal: ${vocales[index]} | Errores: ${errors} | Tiempo de respuesta: ${time.toFixed(2)}s`
      );
    });
  
    console.log(`Errores totales: ${totalErrors}`);
    console.log(`Tiempo total: ${totalTime.toFixed(2)}s`);
  };
  
  

  // Configurar el event listener del teclado
  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentVocal, showInstructions]);

  // Método para iniciar el juego y guardar estado
  const startGame = () => {
    setShowInstructions(false);
    localStorage.setItem(`nivel1_vocales_instructions_${player.name}`, 'started');
  };

  // Método para manejar volver atrás
  const handleBack = () => {
    onBack();
  };

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
              ¡Vamos a aprender las vocales! 🎯
            </h2>
            <p className="text-xl text-gray-600">
              Busca la tarjeta con la vocal que te pida y digítala en el teclado.
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
          // Pantalla de juego completado
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-purple-600 mb-8">
              ¡Felicitaciones! 🎉
            </h2>
            <div className="text-9xl mb-8">🏆</div>
            <p className="text-2xl text-gray-600 mb-8">
              ¡Has completado todas las vocales!
            </p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-8
                     rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
              onClick={onBack}
            >
              Volver al menú
            </button>
          </div>
        ) : (
          // Pantalla del juego
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-purple-600 mb-8">
              Encuentra la vocal:
            </h2>
            
            {/* Vocal actual */}
            <div className="text-9xl font-bold text-blue-500 animate-bounce uppercase">
              {vocales[currentVocal]}
            </div>

            {/* Mensaje de instrucción */}
            <p className="text-2xl text-gray-600">
              Inserta la tarjeta de la vocal {vocales[currentVocal]}
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
              Tu respuesta: <span className="text-3xl font-bold uppercase">{userInput}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vocales;