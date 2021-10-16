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
                    $userAdmin = $_GET['userAdmin'];
                    $passwdAdmin = $_GET['passwdAdmin'];

                    //Verificamos que no estén vacías
                    if(!($userAdmin == "" || $passwdAdmin == "")){
                        //Hacemos la petición para saber si las credenciales son validas
                        $mysql_request = "SELECT * FROM `admin` WHERE `Usuario` ='".$userAdmin."' AND `Passwd` = '".$passwdAdmin."';";
                        $mysql_response = mysqli_query($link, $mysql_request);

                        if($mysql_response){
                            http_response_code(200);
                            if(mysqli_affected_rows($link) > 0){
                                //Mandamos llamar la funcion para usar las variables de sesión
                                session_start();
                                    
                                //Guardamos las variables de sesión
                                $_SESSION['token'] = 'admin';

                                echo json_encode(array(
                                    "message" => "Credenciales correctas",
                                    "status" => "OK",
                                ));    
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