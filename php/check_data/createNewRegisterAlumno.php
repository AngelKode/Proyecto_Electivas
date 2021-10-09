<?php

    function createRegisterAlumno($alumnoDATA){
    
        include '../database/databaseConection.php';

        //Definimos el encabezado para setear el set de caracteres
        header("Content-Type: text/html;charset=utf-8");

        //Configuramos el set de caracteres para la consulta
        mysqli_set_charset($link, "utf8");

        $mysqli_query_alumno = "INSERT INTO `alumno`(`Nombre`,`Programa`,`Boleta`) VALUES('".$alumnoDATA['Nombre']."','".$alumnoDATA['Carrera']."','".$alumnoDATA['boleta']."');";
        $mysqli_response = mysqli_query($link, $mysqli_query_alumno);
        $response_register = array();
        if($mysqli_response){
            //Checamos si se agregó correctamente
            if(mysqli_affected_rows($link) > 0){
                //Si se agregó correctamente, agregamos los registros en la tabla de sus electivas, dependiendo su carrera

                //Obtenemos el ID que se le asignó al alumno
                $idAlumno = mysqli_insert_id($link);

                $registersToAdd = array();
                switch($alumnoDATA['Carrera']){
                    case 'ING. EN SISTEMAS COMPUTACIONALES':{
                        $registersToAdd = array(
                            'Electiva 1' => array(
                                'Creditos' => 20
                            )
                        );
                        break;
                    }
                    case 'ING. MECATRÓNICA':{
                        $registersToAdd = array(
                            'Electiva 1' => array(
                                'Creditos' => 7
                            ),
                            'Electiva 2' => array(
                                'Creditos' => 7
                            ),
                            'Electiva 3' => array(
                                'Creditos' => 7
                            )
                        );
                        break;
                    }
                    case 'ING. AMBIENTAL':{
                        $registersToAdd = array(
                            'Electiva 1' => array(
                                'Creditos' => 6
                            )
                        );
                        break;
                    }
                    case 'ING. EN ALIMENTOS':{
                        $registersToAdd = array(
                            'Electiva 1' => array(
                                'Creditos' => 3
                            ),
                            'Electiva 2' => array(
                                'Creditos' => 3
                            )
                        );
                        break;
                    }
                    default:{
                        $registersToAdd = array(
                            'Electiva 1' => array(
                                'Creditos' => 12
                            )
                        );
                        break;
                    }
                };

                //Ya que tenemos cuantos registros se van a crear, creamos los registros en la BD
                foreach($registersToAdd as $nombreElectiva=>$datosElectiva){
                    $mysqli_query = "INSERT INTO `electiva`(`Alumno_id`,`Nombre`,`Creditos`,`Creditos_acumulados`) VALUES('".intval($idAlumno)."','".$nombreElectiva."','".$datosElectiva['Creditos']."','0');";
                    $mysqli_response = mysqli_query($link, $mysqli_query);
                    if(!$mysqli_response){
                        $response_register = array(
                            "status" => "Danger",
                            "message" => "Error en la base de datos. Inténtelo nuevamente"
                        );
                        return $response_register;
                    }
                }

                $response_register = array(
                    "status" => "OK",
                    "token"  => $idAlumno
                );

            }else{
                $response_register = array(
                    "status" => "Danger",
                    "message" => "No se pudo agregar el alumno correctamente. Inténtelo nuevamente"
                );
            }
        }else{
            $response_register = array(
                "status" => "Danger",
                "message" => "Error en la base de datos. Inténtelo nuevamente"
            );
        }

        //Nos desconectamos de la BD
        mysqli_close($link);

        return $response_register;
    }

?>