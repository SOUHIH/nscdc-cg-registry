/**
 * =====================================================
 * NSCDC CG REGISTRY MANAGEMENT SYSTEM
 * CLOUDFLARE PAGES API BRIDGE
 * =====================================================
 *
 * Development stage:
 * Only the "config" action is allowed.
 *
 * Search and save will be enabled later after
 * authentication/security is added.
 */

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzGrGH74ls9krPRknogtMGL70Fpv49TaW9c0GraWS2DnAcJYTkdFWFrIWpLBb0N_vs/exec';


/**
 * =====================================================
 * CORS / JSON HEADERS
 * =====================================================
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};


/**
 * =====================================================
 * MAIN FUNCTION
 * =====================================================
 */

export async function onRequest(context) {

  const request = context.request;

  /**
   * ---------------------------------------------------
   * OPTIONS
   * ---------------------------------------------------
   */

  if (request.method === 'OPTIONS') {

    return new Response(null, {
      status: 204,
      headers: JSON_HEADERS
    });

  }


  /**
   * ---------------------------------------------------
   * GET
   * ---------------------------------------------------
   *
   * Simple health check.
   */

  if (request.method === 'GET') {

    return jsonResponse({

      success: true,

      message:
        'NSCDC Registry API Bridge is online.',

      stage:
        '3D-2A',

      allowedAction:
        'config'

    });

  }


  /**
   * ---------------------------------------------------
   * ONLY POST IS ALLOWED FOR API REQUESTS
   * ---------------------------------------------------
   */

  if (request.method !== 'POST') {

    return jsonResponse({

      success: false,

      message:
        'Method not allowed.'

    }, 405);

  }


  try {

    /**
     * -------------------------------------------------
     * READ REQUEST
     * -------------------------------------------------
     */

    const requestBody =
      await request.json();


    const action =
      String(
        requestBody.action || ''
      ).trim();


    /**
     * -------------------------------------------------
     * DEVELOPMENT SECURITY LIMIT
     * -------------------------------------------------
     *
     * At this stage we allow ONLY:
     *
     *     action: "config"
     *
     * Search and save are deliberately blocked.
     */

    if (action !== 'config') {

      return jsonResponse({

        success: false,

        message:
          'This API action is not available yet.'

      }, 403);

    }


    /**
     * -------------------------------------------------
     * FORWARD REQUEST TO APPS SCRIPT
     * -------------------------------------------------
     */

    const appsScriptResponse =
      await fetch(
        APPS_SCRIPT_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              action: 'config'
            }),

          redirect: 'follow'
        }
      );


    /**
     * -------------------------------------------------
     * READ APPS SCRIPT RESPONSE
     * -------------------------------------------------
     */

    const responseText =
      await appsScriptResponse.text();


    /**
     * -------------------------------------------------
     * RETURN RESPONSE TO WEBSITE
     * -------------------------------------------------
     */

    return new Response(
      responseText,
      {
        status:
          appsScriptResponse.status,

        headers:
          JSON_HEADERS
      }
    );


  } catch (error) {

    return jsonResponse({

      success: false,

      message:
        'API bridge error.',

      error:
        error.message ||
        'Unknown error.'

    }, 500);

  }

}


/**
 * =====================================================
 * JSON RESPONSE HELPER
 * =====================================================
 */

function jsonResponse(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {
      status: status,
      headers: JSON_HEADERS
    }
  );

}
