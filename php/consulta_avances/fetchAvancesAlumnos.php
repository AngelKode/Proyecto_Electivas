<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Hacemos la peticion a la BD, de los alumnos con sus electivas correspondientes
    $mysqli_request = "SELECT alumno.ID as 'id_alumno', alumno.Nombre as 'nombre_alumno', alumno.Programa as 'programa_alumno', alumno.Boleta as 'boleta_alumno' , electiva.ID as 'id_electiva', electiva.Nombre as 'nombre_electiva', electiva.Creditos, electiva.Creditos_acumulados FROM `alumno` INNER JOIN `electiva` ON electiva.Alumno_id = alumno.ID ORDER BY electiva.Nombre";
    $mysqli_response = mysqli_query($link, $mysqli_request);

    //Checamos que hayamos obtenido alguna respuesta
    if($mysqli_response){
        
        //Inicializamos una nueva posicion en el arreglo
        $serverResponse['data'] = array();

        while($rowData = mysqli_fetch_array($mysqli_response)){

            //Checamos si ya encontramos un registros de el actual alumno, si no, creamos un nuevo arreglo
            if(!isset($serverResponse['data'][$rowData['nombre_alumno']])){
                $serverResponse['data'][$rowData['nombre_alumno']] = array();
            }

            //Obtenemos los datos y los asignamos a un nuevo arreglo
            $data = array();
            $data['id_alumno'] = $rowData['id_alumno'];
            $data['boleta_alumno'] = $rowData['boleta_alumno'];
            $data['programa_alumno'] = $rowData['programa_alumno'];
            $data['id_electiva'] = $rowData['id_electiva'];
            $data['nombre_electiva'] = $rowData['nombre_electiva'];
            $data['Creditos'] = $rowData['Creditos'];
            $data['Creditos_acumulados'] = $rowData['Creditos_acumulados'];

            //Agregamos al arreglo del alumno, los datos de la electiva
            array_push($serverResponse['data'][$rowData['nombre_alumno']], $data);
        }
        $serverResponse['status'] = 'success';
        $serverResponse['message'] = 'Datos obtenidos correctamente';
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
    }

    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);


    //Nos desconectamos de la BD
    mysqli_close($link);
?>