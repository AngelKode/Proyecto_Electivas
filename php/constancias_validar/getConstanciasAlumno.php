<?php

    include '../database/databaseConection.php';

    $serverResponse = array();

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");
    
    if(isset($_GET['Alumno_id'])){
        //Hacemos la peticion para obtener los creditos de las constancias del alumno que ya fueron validados
        $mysql_request = "SELECT constancia.Creditos, constancia.ID FROM `constancia` WHERE Alumno_id ='".intval($_GET['Alumno_id'])."' AND Valida = '2' ORDER BY `Actividad` ASC;";
        $mysql_response = mysqli_query($link,$mysql_request);
        
        if($mysql_response){
            while($row = mysqli_fetch_array($mysql_response)){
                $data = array();
                $data['Creditos'] = $row['Creditos'];
                $data['ID'] = $row['ID'];
                array_push($serverResponse, $data);
            }
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";  
        }
    }else if(isset($_GET['ID_Constancia'])){
        //Hacemos la peticion para obtener los datos de la constancia a actualizar 
        $columns_data_select = "constancia.ID,constancia.Denominacion_id,constancia.Fecha_inicio,constancia.Fecha_fin,constancia.Horas,constancia.Archivo,constancia.Actividad,constancia.Observaciones_encargado,constancia.Valida,constancia.Alumno_id ,alumno.Nombre";
        $mysql_request = "SELECT ".$columns_data_select." FROM `constancia` INNER JOIN alumno ON constancia.Alumno_id = alumno.ID WHERE `constancia`.`ID` ='".intval($_GET['ID_Constancia'])."';";
        $mysql_response = mysqli_query($link,$mysql_request);

        if($mysql_response){
            $row = mysqli_fetch_array($mysql_response);
            $data = array();
            $data['ID'] = $row['ID'];
            $data['Alumno_id'] = $row['Alumno_id'];
            $data['Denominacion_id'] = $row['Denominacion_id'];
            $data['Actividad'] = $row['Actividad'];
            $data['Fecha_inicio'] = $row['Fecha_inicio'];
            $data['Fecha_fin'] = $row['Fecha_fin'];
            $data['Horas'] = $row['Horas'];
            $data['Archivo'] = $row['Archivo'];
            $data['Observaciones_encargado'] = $row['Observaciones_encargado'];
            $data['Valida'] = $row['Valida'];
            $data['Nombre'] = $row['Nombre'];
            array_push($serverResponse, $data);
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";  
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);
?>