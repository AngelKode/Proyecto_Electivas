<?php
    include '../database/databaseConection.php';

     //Definimos el encabezado para setear el set de caracteres
     header("Content-Type: text/html;charset=utf-8");

     //Configuramos el set de caracteres para la consulta
     mysqli_set_charset($link, "utf8");

    //Obtenemos los datos a agregarse
    $dataActividad = $_POST['Actividad']; 
    $dataFechaInicio = $_POST['FechaInicio'];
    $dataFechaFin = $_POST['FechaFin'];
    $dataHoras = $_POST['Horas'];
    $dataFileName = uniqid()."-data-".$_POST['FileName'];
    $dataObservaciones = $_POST['Observaciones'];            
    
    $serverResponse = array();

    //Verificamos que los datos se hayan mandado
    if(isset($dataActividad) && isset($dataFechaInicio) && isset($dataFechaFin) && isset($dataHoras) && isset($dataFileName) && isset($dataObservaciones)){
        //Hacemos la peticion a la base de datos
        $mysql_request = "INSERT INTO `constancia`(`Alumno_id`, `Actividad`, `Fecha_inicio`, `Fecha_fin`, `Horas`, `Archivo`, `Observaciones`,`Valida`) VALUES (".intval($_COOKIE['token_id']).",'".$dataActividad."','".$dataFechaInicio."','".$dataFechaFin."','".$dataHoras."','".$dataFileName."','".$dataObservaciones."','1')";
        $mysql_response = mysqli_query($link, $mysql_request);

        //Verificamos que la peticion se haya realizado correctamente
        if($mysql_response && (mysqli_affected_rows($link) > 0)){
            //Al agregarse correctamente, subimos el archivo
            $urlDirectorio = "../../files/";
            $locationFileToUpload = $urlDirectorio . $dataFileName;

            //Verificamos que se haya subido correctamente
            if(move_uploaded_file($_FILES['FileData']['tmp_name'],$locationFileToUpload)){
                $serverResponse['status'] = "success";
                $serverResponse['message'] = "La constancia se ha guardado correctamente. Estado Actual: '<i>En espera de revisión</i>'";
                $serverResponse['newFileName'] = $dataFileName;//Mandamos el nombre que se le asignó en el servidor al archivo
                $serverResponse['ID'] =  mysqli_insert_id($link);//Obtenemos el ID que se le asignó al nuevo registro
            }else{
                $serverResponse['status'] = "warning";
                $serverResponse['message'] = "Ha ocurrido un error al subir el archivo. Inténtelo nuevamente.'";
            }

        }else{
            $serverResponse['status'] = "warning";
            $serverResponse['message'] = "No se ha podido subir la constancia. Inténtelo nuevamente";
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Cerramos la conexión
    mysqli_close($link);
?>