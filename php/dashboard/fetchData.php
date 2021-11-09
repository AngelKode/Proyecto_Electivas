<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();
    $mysqli_multi_query = "SELECT count(*) as 'numero_alumnos' FROM `alumno`;SELECT count(*) as 'num_constancias_validadas' FROM `constancia` WHERE Valida = 2;SELECT count(*) as 'num_constancias_no_validadas' FROM `constancia` WHERE Valida = 3;SELECT count(*) as 'num_electivas_liberadas' FROM `electiva` WHERE Creditos_acumulados >= Creditos;SELECT constancia.Fecha_Recibido FROM `constancia` WHERE constancia.Fecha_Recibido IS NOT NULL ORDER BY constancia.Fecha_Recibido;";
    $mysqli_response = mysqli_multi_query($link, $mysqli_multi_query);

    //Verificamos que se haya hecho con exito las consultas
    if($mysqli_response){
        //Recorremos todos los resultados
        $counterQuery = 1;
        do{
            //Checamos que obtengamos resultados de la consulta
            if($resultDataActualRequest = mysqli_store_result($link)){
                
                //Checamos si el resultado ya es de las fechas de las constancias recibidas
                if($counterQuery > 4){
                    $serverResponse['fechas_constancias_recibidas'] = array();
                    while($dataRow = mysqli_fetch_array($resultDataActualRequest)){
                        array_push($serverResponse['fechas_constancias_recibidas'], $dataRow['Fecha_Recibido']);
                    }
                }else{
                    //Si tenemos resultados, obtenemos los datos y los agregamos al arreglo que retornaremos
                    $dataRowActualRequest = mysqli_fetch_array($resultDataActualRequest);
                    foreach($dataRowActualRequest as $key => $value){
                        if($key != 0){
                            $serverResponse[$key] = $value;
                        }
                    }
                }
                $counterQuery++;
            }
        }while(mysqli_next_result($link));
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
    }
    
    echo json_encode($serverResponse);
    //Nos desconectamos de la BD
    mysqli_close($link);
?>