<?php
  
namespace App\Http\Controllers\Api;
  
use Illuminate\Http\Request;
use App\Http\Controllers\Controller as Controller;
  
class BaseController extends Controller
{
    /**
     * status response method.
     *
     * @return \Illuminate\Http\Response
     */
    public function sendResponse($result, $message)
    {
        $response = [
            'status' => true,
            'message' => $message,
            'data'    => $result,
        ];
  
        return response()->json($response, 200);
    }
  
    /**
     * return error response.
     *
     * @return \Illuminate\Http\Response
     */
    public function sendError($error, $errorMessages = [], $code = 401)
    {
        $response = [
            'status' => false,
            'message' => $error,
        ];
  
        if(!empty($errorMessages)){
            $response['errors'] = $errorMessages;
        }
  
        return response()->json($response, $code);
    }
}