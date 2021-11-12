<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();
    $serverResponse['data'] = array();
    $mysqli_multi_request = "SELECT count(*) as 'numero_alumnos' FROM `alumno`;SELECT count(*) as 'num_constancias_validadas' FROM `constancia` WHERE Valida = 2;SELECT count(*) as 'num_constancias_no_validadas' FROM `constancia` WHERE Valida = 3;SELECT count(*) as 'num_electivas_liberadas' FROM `electiva` WHERE Creditos_acumulados >= Creditos;";
    $mysqli_response = mysqli_multi_query($link, $mysqli_multi_request);

    if($mysqli_response){
        $data = array();//Inicializamos el array para guardar los datos de la peticion
        do{
            if($resultDataActualRequest = mysqli_store_result($link)){
                //Si tenemos resultados, obtenemos los datos y los agregamos al arreglo que retornaremos
                $dataRowActualRequest = mysqli_fetch_array($resultDataActualRequest);
                unset($dataRowActualRequest[0]);//Eliminamos el elemento de la posicion 0, ya que es un dato repetido
                array_push($data, $dataRowActualRequest);//agregamos al arreglo de datos el dato obtenido
            }
        }while(mysqli_next_result($link));//Hacemos lo anterior mientras haya resultados del multi_query
        array_push($serverResponse['data'], $data);//Agregamos en la posicion 'data' todos los datos obtenidos
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
    }

    echo json_encode($serverResponse);
    //Nos desconectamos de la BD
    mysqli_close($link);
?>