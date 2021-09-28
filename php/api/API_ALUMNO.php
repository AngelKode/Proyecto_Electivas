<?php
    include_once '../database/databaseConection.php';

    //Configuramos los header
    header("Access-Control-Allow-Origin: *");//Poder hacer la peticion desde cualquier origen
    header("Content-Type: application/json; charset=UTF-8");//Especificamos el tipo de contenido y el set de caracteres
    header("Access-Control-Allow-Methods: GET");//Solo poder hacer peticiones GET
    mysqli_set_charset($link, "utf8");//Configuramos el set de caracteres para la consulta a MYSQL    
    date_default_timezone_set("America/Mexico_City");
    
/*     if($_SERVER['REQUEST_URI'] == "login"){ */
        if($_SERVER['REQUEST_METHOD']){ 
            switch($_SERVER['REQUEST_METHOD']){
                case "GET" : {
                    //Obtenemos los parametros
                    //Obtenemos la boleta y la contraseña
                    $boletaAlumno = $_GET['boletaAlumno'];
                    $passwdAlumno = $_GET['passwdAlumno'];

                    //Verificamos que no estén vacías
                    if(!($boletaAlumno == "" || $passwdAlumno == "")){
                        //Hacemos la petición para saber si las credenciales son validas
                        $mysql_request = "SELECT * FROM `credenciales` WHERE `boleta` ='".intval($boletaAlumno)."' AND `passwd` = '".$passwdAlumno."';";
                        $mysql_response = mysqli_query($link, $mysql_request);

                        if($mysql_response){
                            http_response_code(200);
                            if(mysqli_affected_rows($link) > 0){
                                //Obtenemos el ID del alumno
                                $ID_Alumno = mysqli_fetch_array($mysql_response)['Alumno_id'];

                                //Obtenemos el nombre del alumno
                                $mysql_query_nombre_alumno = "SELECT * FROM `alumno` WHERE ID = '".intval($ID_Alumno)."';";
                                $mysql_response = mysqli_query($link,$mysql_query_nombre_alumno);

                                if($mysql_response){
                                    
                                    //Obtenemos el nombre del alumno de la peticion
                                    $dataAlumno = mysqli_fetch_array($mysql_response);

                                    echo json_encode(array(
                                        "message" => "Credenciales correctas",
                                        "status" => "OK",
                                    ));

                                    //Mandamos llamar la funcion para usar las variables de sesión
                                    session_start();
                                    
                                    //Guardamos las variables de sesión
                                    $_SESSION['token'] = $ID_Alumno;
                                    $_SESSION['nombre'] = $dataAlumno['Nombre'];
                                    $_SESSION['programa'] = $dataAlumno['Programa'];
                                }else{
                                    echo json_encode(array(
                                        "message" => "Error. No se pudo obtener datos del alumno.",
                                        "status" => "Warning"
                                    ));
                                }
                            }else{
                                echo json_encode(array(
                                    "message" => "Credenciales incorrectas",
                                    "status" => "Error",
                                ));
                            }   
                        }else{
                            echo json_encode(array(
                                "message" => "Credenciales incorrectas",
                                "status" => "Error",
                            ));
                        }
                    }else{
                        http_response_code(400);
                        echo json_encode(array(
                            "message" => "Error al hacer la petición. Datos incompletos.",
                            "status" => "Error"
                        ));
                    }
                    break;
                }
                default : {
                    http_response_code(405);
                    echo json_encode(array(
                        "message" => "Método no permitido. Solo se admite -> GET",
                        "status" => "Error"
                    ));
                    break;
                }
            }
        }else{
            http_response_code(400);
            echo json_encode(array(
                "message" => "Error al hacer la petición. Petición incorrecta.",
                "status" => "Error"
            ));
        }
/*     }else{
        http_response_code(404);
        echo json_encode(array(
            "message" => "Error al hacer la petición. URL incorrecta."
        ));
    } */

    //Nos desconectamos de la BD
    mysqli_close($link);
?>