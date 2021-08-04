<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");
    
    $serverResponse = array();

    //Verificamos que se hayan recibido los datos
    if(isset($_POST['ID']) && isset($_POST['Denominacion_id']) && isset($_POST['Valida']) && isset($_POST['Observaciones_encargado']) && isset($_POST['Creditos']) && isset($_POST['Alumno_id'])){
        
        //En caso de que se valide la constancia, añadimos el registro a la tabla de todas las constancias validadas
        if($_POST['Valida'] == 2){

            //Obtenemos el ID de la electiva que se va a actualizar
            $mysql_request_get_id_electiva = "SELECT * FROM `electiva` WHERE `Alumno_id` = ".$_POST['Alumno_id']." AND (`Creditos_acumulados` < `Creditos`) ORDER BY Nombre;";
            //Hacemos la petición para obtener el ID
            $mysql_response = mysqli_query($link, $mysql_request_get_id_electiva);

            /** VERIFICACION DE LA OBTENCIÓN DE LAS ELECTIVAS DEL ALUMNO**/
            if($mysql_response){
                //Si se hizo correctamente, obtenemos el ID de el primer renglón, ya que es la electiva que actualmente se está sumando
                $electiva_to_update = mysqli_fetch_array($mysql_response);
                $ID_Electiva = $electiva_to_update['ID'];
                
                //Verificamos que sea un numero
                if(is_numeric($ID_Electiva)){
                    //Creamos las peticiones que se harán al validarse la constancia
                    //Hacemos la suma de los créditos nuevos
                    $creditos_actualizados = $electiva_to_update['Creditos_acumulados'] + $_POST['Creditos'];

                    $mysql_request_update_electiva = "UPDATE `electiva` SET `Creditos_acumulados` = ".$creditos_actualizados." WHERE ID = ".$ID_Electiva;//Actualizamos los créditos del alumno
                    $mysql_request_update_constancia = "UPDATE `constancia` SET `Denominacion_id` = '".$_POST['Denominacion_id']."', `Valida` = '".$_POST['Valida']."', `Observaciones_encargado` = '".$_POST['Observaciones_encargado']."', `Creditos` = '".$_POST['Creditos']."' WHERE ID = ".$_POST['ID'];//Actualizamos la constancia del alumno
                    $mysql_request_add_constancia_valida = "INSERT INTO `constancia_electiva`(`Electiva_id`, `Constancia_id`, `Creditos`) VALUES ('".$ID_Electiva."','".$_POST['ID']."','".$_POST['Creditos']."')";//Agregamos la constancia a las constancias que ya han sido validadas
                    $mysql_request = $mysql_request_update_constancia .";". $mysql_request_add_constancia_valida .";". $mysql_request_update_electiva;
                    
                    $mysql_response = mysqli_multi_query($link, $mysql_request);

                    /** VERIFICACION DE LAS ACTUALIZACIONES EN LAS CONSTANCIAS Y LAS ELECTIVAS DEL ALUMNO **/
                    if($mysql_response){
                        $serverResponse['status'] = "success";
                        $serverResponse['message'] = "La revisión se ha guardado correctamente.";
                    }else{
                        $serverResponse['status'] = "danger";
                        $serverResponse['message'] = "Error del servidor, inténtelo nuevamente.";
                    }
                }else{
                    $serverResponse['status'] = "danger";
                    $serverResponse['message'] = "Error de la base de datos, inténtelo nuevamente.";
                }
            }else{
                $serverResponse['status'] = "danger";
                $serverResponse['message'] = "Error de la base de datos, inténtelo nuevamente.";
            }        
        }else{
            //Si no se valida la constancia, unicamente actualizamos el registro de la constancia del alumno
            $mysql_request_update_constancia = "UPDATE `constancia` SET `Valida` = '".$_POST['Valida']."', `Observaciones_encargado` = '".$_POST['Observaciones_encargado']."', `Creditos` = '".$_POST['Creditos']."' WHERE ID = ".$_POST['ID'];  

            $mysql_response = mysqli_query($link, $mysql_request_update_constancia);
            if($mysql_response){
                $serverResponse['status'] = "success";
                $serverResponse['message'] = "La revisión se ha guardado correctamente.";
            }else{
                $serverResponse['status'] = "danger";
                $serverResponse['message'] = "Error del servidor, inténtelo nuevamente."; 
            }
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor, inténtelo nuevamente.";
    }

    //Enviamos la respuesta
    echo json_encode($serverResponse);

    //Cerramos la conexion
    mysqli_close($link);
?>