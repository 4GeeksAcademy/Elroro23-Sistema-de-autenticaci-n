import React from 'react'
import { useState } from 'react' //Permite manejar el estado (variables que cambian).
import { useNavigate } from 'react-router-dom'; //Permite cambiar la página después de ciertas acciones.

const Singup = () => {
    const [email, setemail] = useState(""); //Estado para guardar el valor del email que el usuario ingresa. setemail es la función para actualizar este valor.
    const [password, setpassword] = useState(""); //Crea un estado similar para la contraseña.
    const navigate = useNavigate(); //Crea una función que se puede usar para redirigir a otras páginas.
    const apiUrl = process.env.BACKEND_URL; //Obtiene la URL base de la API desde las variables de entorno.

    const handlesubmit = async (event) => { //Función que se ejecuta cuando el usuario envía el formulario.
        event.preventDefault(); //Evita que el formulario se envíe de manera predeterminada, lo cual recargaría la página.
        try {
            const response = await fetch(`${apiUrl}signup`, { //Envía una solicitud POST a la URL de registro de la API.
                method: "POST",
                headers: {
                    "Content-Type": "application/json" //El cuerpo de la solicitud está en formato JSON.
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

            if (data.msg === "Nuevo usuario creado") { //Si la respuesta indica que el usuario fue creado:
                navigate('/login'); //Redirige al usuario a la página de inicio de sesión.
            } else {
                alert("Error al crear usuario"); //Si algo salió mal, muestra una alerta.
            }
        } catch (error) { //Captura y maneja cualquier error que ocurra durante el proceso.
            console.error("Error en la solicitud:", error);
            alert("Hubo un problema al registrar. Inténtalo de nuevo."); //Si algo salió mal, muestra una alerta.
        }
    };

    return (
        <form onSubmit={handlesubmit}> {/*formulario que llama a handlesubmit cuando se envía.*/}
            <h2>Register</h2>
            <label>Email: {/*Campo para que el usuario ingrese su email.*/}
                <input
                    type="email"
                    value={email}//Vincula el campo de entrada con el estado "email" del componente, lo que veo en el campo de entrada se guarda en la variable "email".
                    onChange={(e) => setemail(e.target.value)} //Cuando escribo algo, esta función actualiza la variable "email" con el nuevo texto que escribí.
                    required //No puede estar vacío.
                />
            </label>
            <label>Contraseña:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}                 
                    required
                />
            </label>
            <button type="submit" className="btn btn-outline-primary">Register</button>
        </form>
    )
}

export default Singup