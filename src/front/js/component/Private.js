import React from 'react'
import { useEffect } from 'react'; //Permite ejecutar código cuando el componente se monta o se actualiza.
import { useState } from 'react'; //Permite manejar el estado (variables que cambian).
import { useNavigate } from 'react-router-dom'; //Permite cambiar la página después de ciertas acciones.
import "../../styles/Private.css";

const Private = () => {
    const [user, setUser] = useState(null); //Variable que guarda la información del usuario y función para actualizar la variable user.
    const navigate = useNavigate(); //Crea una función que se puede usar para redirigir a otras páginas.
    const apiUrl = process.env.BACKEND_URL; //Obtiene la URL base de la API desde las variables de entorno.


    useEffect(() => { //Ejecuta la función "fetchData" cuando el componente se monta.
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("jwt_token"); //Obtiene el token de autenticación almacenado.
                if (!token) { //Si no hay token:
                    navigate('/login'); //Redirige al usuario a la página de inicio de sesión.
                    return; //Termina la ejecución de la función fetchData si no hay un token.
                }
                const response = await fetch(`${apiUrl}private`, { //Envía una solicitud GET a la URL de la página privada de la API.
                    headers: {
                        "Content-Type": "application/json", //El cuerpo de la solicitud está en formato JSON.
                        "Authorization": `Bearer ${token}` //Este encabezado es usado para enviar un token de autenticación junto con la solicitud.
                    }
                });
                if (!response.ok) { //Si la respuesta de la API no es exitosa (código de estado no es 200), lanza un error.
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json(); //Convierte la respuesta de la API en formato JSON.
                setUser(data); //Guarda la información del usuario en el estado.


            } catch (error) { //Captura errores y si los hay:
                console.error('Error en la solicitud:', error);
                navigate('/login'); //Redirige al usuario a la página de inicio de sesión.
            }
        };

        fetchData(); //llamo a la función fetchData.
    }, [navigate]);/*Array de dependencias: useEffect se ejecutará en los siguientes casos:
    Al montar el componente: Cuando el componente se renderiza por primera vez, useEffect se ejecuta.
    Cuando cambie la dependencia: Si el valor de navigate cambia, useEffect se ejecutará de nuevo.
    */

    return (
        <div className='container-private'>
            {user ? ( //Si hay user: Muestra el saludo con el email del usuario y un botón para cerrar sesión.
                <>
                    <div className='title-user text-center' style={{color:"white"}}>
                        <h2>Bienvenido a la Página Privada</h2> <h2><strong>{user.email}</strong></h2>
                    </div>
                    <video autoPlay controls loop style={{width:"75%", height:"75%"}}>
                        <source src='https://media.istockphoto.com/id/1884175246/es/v%C3%ADdeo/hombre-empujando-el-inodoro-con-estre%C3%B1imiento-y-hemorroides-pel%C3%ADcula-4k-c%C3%A1mara-lenta.mp4?s=mp4-640x640-is&k=20&c=E-YskCAy5CNx65AV_gYClhFsM06jqRTNsFO4VCGjsnY=' type="video/mp4" />
                    </video>
                </>
            ) : ( //Si no hay user Muestra:
                <p>Cargando...</p>
            )}
        </div>
    );
};

export default Private;