import React from 'react'
import { useState } from 'react'; //Permite manejar el estado (variables que cambian).
import { useNavigate } from 'react-router-dom'; //Permite cambiar la página después de ciertas acciones.
import { Link } from 'react-router-dom'; //Permite crear enlaces de navegación entre páginas.

const Login = () => {
  const [email, setEmail] = useState(""); //Estado para guardar el valor del email que el usuario ingresa. setemail es la función para actualizar este valor.
  const [password, setPassword] = useState(""); //Crea un estado similar para la contraseña.
  const navigate = useNavigate(); //Crea una función que se puede usar para redirigir a otras páginas.
  const apiUrl = process.env.BACKEND_URL; //Obtiene la URL base de la API desde las variables de entorno.

  const handleSubmit = async (event) => { //Función que se ejecuta cuando el usuario envía el formulario.
    event.preventDefault(); //Evita que el formulario se envíe de manera predeterminada, lo cual recargaría la página.

    try {
      const response = await fetch(`${apiUrl}login`, { //Envía una solicitud POST a la URL de inicio de sesión de la API.
        method: "POST",
        headers: { "Content-Type": "application/json" //El cuerpo de la solicitud está en formato JSON.

        }, 
        body: JSON.stringify({ //El cuerpo de la solicitud contiene el email y la contraseña convertidos a JSON.
          email,
          password
        })
      });

      if (!response.ok) { //Si la respuesta de la API no es exitosa (código de estado no es 200), lanza un error.
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); //Convierte la respuesta de la API en formato JSON.

      

      if (data.jwt_token) { //Si jwt_token existe:
        localStorage.setItem("jwt_token", data.jwt_token); //Guarda el token JWT en el almacenamiento local del navegador.
        navigate('/private'); //Cambia la página a "/private" si el inicio de sesión es exitoso.
      } else {
        alert('Error de autenticación'); //Muestra un mensaje si hay un problema con el inicio de sesión.
      }
    } catch (error) {
      console.error('Error en la solicitud:', error); //Captura errores y muestra un mensaje si algo sale mal.
      alert('Usuario no registrado');
    }
  };

  return (
    <form onSubmit={handleSubmit}> {/*formulario que llama a handlesubmit cuando se envía.*/}
      <h2>Iniciar Sesión</h2>
      <label>Email: {/*Campo para que el usuario ingrese su email.*/}
        <input
          type="email"
          value={email} //Vincula el campo de entrada con el estado "email" del componente, lo que veo en el campo de entrada se guarda en la variable "email".
          onChange={(e) => setEmail(e.target.value)} //Cuando escribo algo, esta función actualiza la variable "email" con el nuevo texto que escribí.
          required //No puede estar vacío el campo.
        />
      </label>
      <label>Contraseña:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Iniciar Sesión</button>
      <Link to="/signup">Click para Registrate</Link> {/*Enlace para ir a la página de registro.*/}
    </form>
  );
};

export default Login