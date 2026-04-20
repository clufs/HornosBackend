import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HornosService } from './hornos.service';

@Injectable()
export class HornosAgentService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly hornosService: HornosService) {
    // Inicializamos Gemini con tu API Key del archivo .env

    this.genAI = new GoogleGenerativeAI(
      'AIzaSyABqwcBrlm7JNqT8RqTViGerL-LF3xtcMw',
    );
  }

  async preguntar(mensajeUsuario: string) {
    // 1. Elegimos el modelo más rápido de Gemini
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    // 2. Buscamos los datos de tu Cóndor Huasi en la base de datos
    const datos = await this.hornosService.obtenerHistorial(1);
    const d = datos[0]; // Tomamos el último registro

    if (!d) {
      return 'Todavía no hay datos registrados en el horno.';
    }

    // 3. Armamos el "Prompt" (Acá le damos el contexto a la IA)
    const prompt = `
      Eres un maestro ceramista experto en hornos a leña tipo Cóndor Huasi.
      
      ESTADO ACTUAL DEL HORNO EN TIEMPO REAL:
      - Temperatura: ${d.temperatura}°C
      - Humedad en el espejo: ${d.hayHumedad ? 'SÍ' : 'NO'}
      
      PREGUNTA DEL USUARIO: "${mensajeUsuario}"
      
      INSTRUCCIONES PARA TU RESPUESTA:
      - Regla estricta: Responde de forma MUY breve. Máximo 2 oraciones.
      - Responde como jarvis de Ironman.
      - Responde de forma directa, técnica y de mayordomo a tonystark. 
      - Respuestas cortas.
      - Si hay humedad y la temperatura es menor a 200°C, advierte del peligro de explosión de las piezas si se apura el fuego.
      - Si la temperatura es alta, da consejos sobre cómo manejar la leña.
    `;

    // 4. Le mandamos todo a Gemini y esperamos su respuesta
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error con Gemini:', error);
      return 'Hubo un problema al consultar al maestro ceramista.';
    }
  }
}
