/**
 * =====================================================
 * NSCDC CG REGISTRY MANAGEMENT SYSTEM
 * CLOUDFLARE PAGES API BRIDGE
 * =====================================================
 *
 * Stage 3D-2B
 *
 * Security:
 * - API requests require REGISTRY_API_SECRET.
 * - The secret is stored in Cloudflare as a Secret.
 * - The secret is NEVER stored in GitHub or index.html.
 *
 * Current development restriction:
 * - Only "config" is allowed.
 * - "search" and "save" remain blocked until
 *   authentication has been fully tested.
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
  const env = context.env;


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
   * Health check.
   *
   * IMPORTANT:
   * We do not expose Registry data here.
   */

  if (request.method === 'GET') {

    return jsonResponse({

      success: true,

      message:
        'NSCDC Registry API Bridge is online.',

      stage:
        '3D-2B',

      security:
        'API secret required',

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


    /**
     * -------------------------------------------------
     * READ ACTION
     * -------------------------------------------------
     */

    const action =
      String(
        requestBody.action || ''
      ).trim();


    /**
     * -------------------------------------------------
     * AUTHENTICATION
     * -------------------------------------------------
     *
     * The expected secret is stored in Cloudflare:
     *
     *     REGISTRY_API_SECRET
     *
     * The browser must provide the same value.
     */

    const suppliedSecret =
      String(
        requestBody.apiSecret || ''
      ).trim();


    const expectedSecret =
      String(
        env.REGISTRY_API_SECRET || ''
      ).trim();


    /**
     * -------------------------------------------------
     * MAKE SURE SECRET EXISTS
     * -------------------------------------------------
     */

    if (!expectedSecret) {

      return jsonResponse({

        success: false,

        message:
          'API security secret is not configured.'

      }, 500);

    }


    /**
     * -------------------------------------------------
     * CHECK SECRET
     * -------------------------------------------------
     */

    if (
      !suppliedSecret ||
      suppliedSecret !== expectedSecret
    ) {

      return jsonResponse({

        success: false,

        message:
          'Unauthorized API request.'

      }, 401);

    }


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
