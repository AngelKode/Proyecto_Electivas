<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Verificamos que se haya recibido los parametros
    if((isset($_POST['email']) || isset($_POST['whatsapp']) || isset($_POST['phone'])) && isset($_POST['modify'])){
        //Checamos si ya hay un registro, si no, creamos uno nuevo
        $mysqli_request = "SELECT * FROM `contacto_soporte`;";
        $mysqli_response = mysqli_query($link, $mysqli_request);
        
        //Verificamos que se haya hecho correctamente la peticion
        if($mysqli_response){

            //Dependiendo si hay o no un registro, hacemos la petición necesaria
            if(mysqli_num_rows($mysqli_response) > 0){
                //Obtenemos el ID
                $dataRow = mysqli_fetch_array($mysqli_response);
                $ID = $dataRow['ID'];

                //Con el ID, y dependiendo que se quiera modificar, hacemos la peticion
                $mysqli_request = "";
                $dataToBeModified = "";
                switch($_POST['modify']){
                    case 'whats_app':{
                        $mysqli_request = "UPDATE `contacto_soporte` SET `whats_app` = '".$_POST['whatsapp']."' WHERE ID = '".intval($ID)."'";
                        $dataToBeModified = "número de WhatsApp";
                        break;
                    }
                    case 'email':{
                        $mysqli_request = "UPDATE `contacto_soporte` SET `email` = '".$_POST['email']."' WHERE ID = '".intval($ID)."'";
                        $dataToBeModified = "email";
                        break;
                    }
                    default : {
                        $mysqli_request = "UPDATE `contacto_soporte` SET `telefono_escuela` = '".$_POST['phone']."' WHERE ID = '".intval($ID)."'";
                        $dataToBeModified = "teléfono";
                        break;
                    }
                }
                $mysqli_response = mysqli_query($link, $mysqli_request);

                if($mysqli_response){
                    //Dependiendo si se hicieron cambios o no, modificamos el mensaje
                    
                    if(mysqli_affected_rows($link)>0){
                        $serverResponse['status'] = 'success';
                        $serverResponse['message'] = 'Se han hecho las modificaciones correctamente.';
                    }else{
                        $serverResponse['status'] = 'info';
                        $serverResponse['message'] = 'No se hicieron modificaciones en el '.$dataToBeModified;
                    }
                    
                }else{
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente';
                }
            }else{
                //Si no hay, agregamos un nuevo registro dependiendo el dato que se haya mandado
                $mysqli_request = "";
                switch($_POST['modify']){
                    case 'whats_app':{
                        $mysqli_request = "INSERT INTO `contacto_soporte` (`".$_POST['modify']."`) VALUES('".$_POST['whatsapp']."');";
                        break;
                    }
                    case 'email':{
                        $mysqli_request = "INSERT INTO `contacto_soporte` (`".$_POST['modify']."`) VALUES('".$_POST['email']."');";
                        break;
                    }
                    default : {
                        $mysqli_request = "INSERT INTO `contacto_soporte` (`".$_POST['modify']."`) VALUES('".$_POST['phone']."');";
                        break;
                    }
                }
                $mysqli_response = mysqli_query($link, $mysqli_request);

                if($mysqli_response){
                    $serverResponse['status'] = 'success';
                    $serverResponse['message'] = 'Se han hecho las modificaciones correctamente.';
                }else{
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente';
                }
            }
    
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente';
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);

?>