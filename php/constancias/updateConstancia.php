<?php

    include '../database/databaseConection.php';

    $newValueActividad = $_POST['Actividad'];
    $newValueFechaInicio = $_POST['FechaInicio'];
    $newValueFechaFin = $_POST['FechaFin'];
    $newValueHoras = $_POST['Horas'];
    $newValueObservaciones = $_POST['Observaciones'];
    $ID = $_POST['ID'];

    $serverResponse = array();

    if(isset($ID) && isset($newValueActividad) && isset($newValueFechaInicio) && isset($newValueFechaFin) && isset($newValueHoras) && isset($newValueObservaciones)){
        //Hacemos la peticion dependiendo si eligió archivo o no
        $mysqli_request = "";
        $fileName = "";
        if(isset($_POST['FileName'])){
            $fileName = uniqid() . "-data-" .$_POST['FileName']; 
            $mysqli_request = "UPDATE `constancia` SET `Actividad`='".$newValueActividad."',`Fecha_inicio`='".$newValueFechaInicio."',`Fecha_fin`='".$newValueFechaFin."',`Horas`='".$newValueHoras."',`Archivo`='".$fileName."',`Observaciones`='".$newValueObservaciones."' WHERE ID =".$ID.";";
        }else{
            $mysqli_request = "UPDATE `constancia` SET `Actividad`='".$newValueActividad."',`Fecha_inicio`='".$newValueFechaInicio."',`Fecha_fin`='".$newValueFechaFin."',`Horas`='".$newValueHoras."',`Observaciones`='".$newValueObservaciones."' WHERE ID =".$ID.";";
        }

        //Hacemos la peticion
        $mysql_response = mysqli_query($link, $mysqli_request);

        if($mysql_response){
            $serverResponse['status'] = "success";
            //Verificamos que se hayan modificado los datos, y checamos si se tiene que actualizar el archivo o no
            if((mysqli_affected_rows($link) > 0)){

                if(isset($_POST['FileName'])){
                    $urlDirectorio = "../../files/";
                    $locationFileToUpload = $urlDirectorio . $fileName;
            
                    //Verificamos que se haya subido correctamente
                    if(move_uploaded_file($_FILES['FileData']['tmp_name'],$locationFileToUpload)){
                        //Eliminamos el archivo anterior
                        unlink($urlDirectorio.$_POST['OldFileName']);
                        $serverResponse['newFileName'] = $fileName;//Mandamos el nombre que se le asignó en el servidor al archivo
                    }else{
                        $serverResponse['status'] = "warning";
                        $serverResponse['message'] = "Ha ocurrido un error al subir el archivo. Inténtelo nuevamente.'";
                    }
                }
                $serverResponse['message'] = "La constancia se ha actualizado correctamente";

            }else{
                $serverResponse['message'] = "No se hicieron modificaciones a la constancia.";
            }
        }else{
            $serverResponse['status'] = "success";
            $serverResponse['message'] = "Error al actualizar los datos. Inténtelo nuevamente.";
        }
       
    }else{
        $serverResponse['status'] = "danger";;
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Cerramos la conexion con la bd
    mysqli_close($link);
?>