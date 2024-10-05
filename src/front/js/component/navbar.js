import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const [isLogged, setIsLogged] = useState(false);
	const navigate = useNavigate();

	
/*El botón no aparece en "private" porque el Navbar ya verificó si habia token cuando se carga la app en login, al no encontrarlo no muestra el botón,
(en login y register nunca va a mostrar el botón ya que estas paginas no necesitan token) pero con navigate en el array de dependencias de "useEffect"
si muestra el botón en "private" ya que el navbar verifica el token cuando useEffect se actualiza gracias a navigate(cuando vamos a private).
*/
	useEffect(() => {
		const token = localStorage.getItem("jwt_token"); //El token dentro del useEffect asegura de que siempre esté el valor actualizado.
		setIsLogged(!!token);
	}, [navigate]);

	const handleLogout = () => {
		if (isLogged) {
			localStorage.removeItem("jwt_token"); // Elimina el token del almacenamiento local.
			setIsLogged(false); // Actualiza el estado local para reflejar que el usuario ha cerrado sesión.
			navigate('/login'); // Redirige al usuario a la página de inicio de sesión.
		}
	};
	return (
		<nav className="navbar navbar-light bg-white">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Home</span>
				</Link>
				{isLogged ? (
					<div className="ml-auto">
						<button className="btn btn-primary" type="button" onClick={handleLogout}>Logout</button>
					</div>
				) : null}
			</div>
		</nav>
	);
};
