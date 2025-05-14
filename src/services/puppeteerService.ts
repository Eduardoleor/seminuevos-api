import puppeteer from "puppeteer";
import path from "path";
import { validateParam } from "../utils/validateParams";
import { logger } from "../utils/logger";

declare module "puppeteer" {
  interface Page {
    waitForTimeout?: (ms: number) => Promise<void>;
  }
}

export const publishAdOnSemiNuevos = async (
  price: number,
  description: string
) => {
  const DEFAULT_PAGE = process.env.PAGE_SEMINUEVOS || "";
  const DEFAULT_LOGIN_PAGE = process.env.PAGE_SEMINUEVOS_LOGIN || "";
  const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT) || 30000;
  const NAVIGATION_TIMEOUT = Number(process.env.NAVIGATION_TIMEOUT) || 60000;

  const CONFIG = {
    headless: true,
    args: [
      "--disable-notifications",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
    ],
    defaultViewport: null,
  };

  const BLOCKED_RESOURCES = ["image", "stylesheet", "font", "media"];

  // Validate parameters
  const isValidPrice = validateParam(price, "number");
  const isValidDescription = validateParam(description, "string");

  if (!isValidPrice) {
    throw new Error("El precio debe ser un número válido.");
  }

  if (!isValidDescription) {
    throw new Error("La descripción debe ser una cadena de texto válida.");
  }

  if (!price || !description) {
    throw new Error("Faltan parámetros obligatorios.");
  }

  const browser = await puppeteer.launch(CONFIG);
  const page = await browser.newPage();

  // Add debug hooks
  page.on("console", (msg) => logger.info("📝 PAGE LOG:", msg.text()));
  page.on("response", (response) =>
    logger.info(`📦 RESPONSE: ${response.status()} ${response.url()}`)
  );
  page.on("requestfailed", (request) =>
    logger.error(
      "❌ REQUEST FAILED:",
      request.url(),
      request.failure()?.errorText
    )
  );

  // Logic and processing
  if (!page.waitForTimeout) {
    page.waitForTimeout = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
  }

  try {
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    const requestHandler = (req: any) => {
      BLOCKED_RESOURCES.includes(req.resourceType())
        ? req.abort()
        : req.continue();
    };

    await page.setRequestInterception(true);
    page.on("request", requestHandler);

    await page.goto(DEFAULT_PAGE, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT,
    });

    const navigateLogin = async () => {
      const loginButton = await page.waitForSelector("a.login-btn", {
        visible: true,
        timeout: 40000,
      });

      await Promise.all([
        loginButton?.click(),
        page.waitForNavigation({
          waitUntil: "domcontentloaded",
          timeout: NAVIGATION_TIMEOUT,
        }),
      ]);

      if (!page.url().startsWith(DEFAULT_LOGIN_PAGE)) {
        throw new Error("Failed to reach login page");
      }

      await page.waitForSelector("#email", { visible: true });
      await page.type("#email", process.env.EMAIL_SEMINUEVOS || "", {
        delay: 30,
      });

      await page.waitForSelector("#password", { visible: true });
      await page.type("#password", process.env.PASSWORD_SEMINUEVOS || "", {
        delay: 30,
      });

      await Promise.all([
        page.click("button[type='submit']"),
        page.waitForNavigation({
          waitUntil: "networkidle0",
          timeout: NAVIGATION_TIMEOUT * 2,
        }),
      ]);
    };

    const pressPublishButton = async () => {
      const selector = 'a.btn-primary[href*="/publicar"]';
      await page.waitForSelector(selector, {
        visible: true,
        timeout: DEFAULT_TIMEOUT,
      });

      const publishButton = await page.$(selector);
      if (!publishButton) throw new Error("Publish button not found");

      await publishButton.hover();
      await page?.waitForTimeout?.(500);
      await publishButton.evaluate((btn) => {
        btn.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      return publishButton;
    };

    const setPlanSelection = async () => {
      try {
        await page.waitForSelector(".mantine-Button-root", { timeout: 30000 });
        const firstPlanButton = await page.evaluateHandle(() => {
          const xpath = '(//button[.//*[contains(text(), "Elegir plan")]])[1]';
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          return result as HTMLElement;
        });

        if (!firstPlanButton) {
          throw new Error('No "Elegir plan" buttons found');
        }

        await firstPlanButton.evaluate((button) => {
          button.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        await page.waitForFunction(
          (button) => !(button as HTMLButtonElement).disabled,
          {},
          firstPlanButton
        );

        await page?.waitForTimeout?.(1000);
        await Promise.all([
          firstPlanButton.click(),
          page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
        ]);
      } catch (error: any) {
        await page.screenshot({ path: "plan-selection-error.png" });
        throw new Error(`First plan selection failed: ${error.message}`);
      }
    };

    const writeFillForm = async () => {
      const fillInputByLabel = async (labelText: string, value: string) => {
        try {
          const inputHandle = await page.evaluateHandle((labelText) => {
            const xpath = `//label[contains(text(), '${labelText}')]/following-sibling::div//input`;
            const result = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            return result as HTMLElement;
          }, labelText);

          if (!inputHandle) {
            throw new Error(`${labelText} input not found`);
          }

          const inputElement = inputHandle.asElement() as any;

          if (!inputElement) {
            throw new Error(`Could not resolve ${labelText} input element`);
          }

          await inputElement.click({ clickCount: 3 });
          await page.keyboard.press("Backspace");
          await page?.waitForTimeout?.(300);
          await inputElement.type(value, { delay: 50 });
          await page?.waitForTimeout?.(800);

          if (labelText !== "Recorrido") {
            await page.keyboard.press("ArrowDown");
            await page?.waitForTimeout?.(300);
            await page.keyboard.press("Enter");
          }

          await page.waitForFunction(
            (input, expectedValue) => input.value.includes(expectedValue),
            {},
            inputElement,
            value
          );
        } catch (error: any) {
          await page.screenshot({ path: `${labelText}-input-error.png` });
          throw new Error(`Failed to fill ${labelText}: ${error.message}`);
        }
      };

      // Fill form fields with error handling
      try {
        await fillInputByLabel("Marca", "Acura");
        await fillInputByLabel("Modelo", "ILX");
        await fillInputByLabel("Año", "2018");
        await fillInputByLabel("Versión", "2.4 Tech At");
        await fillInputByLabel("Subtipo", "Sedán");
        await fillInputByLabel("Color", "Negro");
        await fillInputByLabel("Código Postal", "64000");
        await fillInputByLabel("Ciudad del vehículo", "Monterrey");
        await fillInputByLabel("Recorrido", "20000");
      } catch (error) {
        await page.screenshot({ path: "form-fill-error.png" });
        throw error;
      }
    };

    const writeFillPrice = async (price: string) => {
      try {
        if (!price || typeof price !== "string") {
          throw new Error("Invalid price parameter");
        }

        const priceInput = (await page.waitForSelector(
          'input.mantine-NumberInput-input[placeholder="$ "]',
          { visible: true, timeout: 30000 }
        )) as any;

        await priceInput.click({ clickCount: 3 });
        await page.keyboard.press("Backspace");
        await priceInput.type(price, { delay: 50 });

        const enteredValue = await priceInput.evaluate((el: HTMLInputElement) =>
          el.value.replace(/[^0-9]/g, "")
        );

        if (enteredValue !== price.replace(/[^0-9]/g, "")) {
          throw new Error(
            `Price validation failed. Expected: ${price}, Actual: ${enteredValue}`
          );
        }
      } catch (error: any) {
        await page.screenshot({ path: `price-error-${Date.now()}.png` });
        throw new Error(`Price input failed: ${error.message}`);
      }
    };

    const selectNegotiableOption = async () => {
      try {
        const radioGroup = await page.waitForSelector(
          'div[role="radiogroup"]',
          {
            visible: true,
            timeout: 30000,
          }
        );

        const negociableLabel = await page.evaluateHandle(() => {
          const xpath =
            '//label[contains(@class, "mantine-Radio-label") and contains(text(), "Negociable")]';
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          return result as HTMLElement;
        });

        if (!negociableLabel) {
          throw new Error("Negociable label not found");
        }

        const negociableRadio = await negociableLabel.evaluateHandle(
          (label) => {
            const radioRoot = label.closest(".mantine-Radio-root");
            return radioRoot?.querySelector('input[type="radio"]');
          }
        );

        if (!negociableRadio) {
          throw new Error("Negociable radio input not found");
        }

        const radioElement = negociableRadio.asElement() as any;

        await radioElement.evaluate((el: any) =>
          el.scrollIntoView({
            behavior: "auto",
            block: "center",
          })
        );

        await page?.waitForTimeout?.(500);
        await radioElement.click();

        await page.waitForFunction(
          (radio) => (radio as HTMLInputElement).checked,
          {},
          negociableRadio
        );
      } catch (error: any) {
        await page.screenshot({ path: `radio-error-${Date.now()}.png` });
        throw new Error(`Negociable selection failed: ${error.message}`);
      }
    };

    const pressContinueButton = async () => {
      try {
        const siguienteButton = await page.evaluateHandle(() => {
          const xpath = '//button[.//span[normalize-space()="Siguiente"]]';
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          return result as HTMLElement;
        });
        if (!siguienteButton) {
          throw new Error('"Siguiente" button not found');
        }

        await siguienteButton.click();

        try {
          await page.waitForSelector('[data-headlessui-state="open"]', {
            visible: true,
            timeout: 5000,
          });

          const continuarButton = await page.evaluateHandle(() => {
            const xpath = '//button[normalize-space()="Continuar"]';
            const result = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            return result as HTMLElement;
          });

          await continuarButton.click();

          await page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 10000,
          });
        } catch (modalError) {
          await page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 10000,
          });
        }
      } catch (error: any) {
        await page.screenshot({ path: `next-error-${Date.now()}.png` });
        throw new Error(`Next step failed: ${error.message}`);
      }
    };

    const writeDescription = async (description: string) => {
      try {
        const editorContainer = (await page.waitForSelector(
          "div.mantine-RichTextEditor-content",
          { visible: true, timeout: DEFAULT_TIMEOUT }
        )) as any;

        const contentEditableDiv = (await editorContainer.waitForSelector(
          'div[contenteditable="true"].tiptap.ProseMirror',
          { visible: true, timeout: DEFAULT_TIMEOUT }
        )) as any;

        if (!contentEditableDiv) {
          throw new Error("Description editor not found");
        }

        await contentEditableDiv.click({ clickCount: 3 });
        await page?.waitForTimeout?.(500);
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");
        await page?.waitForTimeout?.(500);

        await contentEditableDiv.type(description, { delay: 30 });
        const enteredText = await contentEditableDiv.evaluate(
          (el: any) => el.textContent
        );
        if (!enteredText?.includes(description)) {
          throw new Error("Description text verification failed");
        }
        await page.keyboard.press("Tab");
        await page?.waitForTimeout?.(1000);
      } catch (error: any) {
        await page.screenshot({ path: `description-error-${Date.now()}.png` });
        throw new Error(`Failed to set description: ${error.message}`);
      }
    };

    const uploadImages = async () => {
      try {
        const fileInput = await page.waitForSelector(
          'input[type="file"][accept*="image"]',
          { timeout: NAVIGATION_TIMEOUT }
        );

        const imagePaths = [
          path.resolve(__dirname, "../assets/car-1.png"),
          path.resolve(__dirname, "../assets/car-2.png"),
          path.resolve(__dirname, "../assets/car-3.png"),
        ];

        let retries = 3;
        while (retries > 0) {
          try {
            await fileInput?.uploadFile(...imagePaths);
            const isUploaded = await page.evaluate(
              (input) => input?.files?.length === 3,
              fileInput
            );
            if (isUploaded) break;
          } catch (uploadError) {
            retries--;
            if (retries === 0) throw uploadError;
            await page?.waitForTimeout?.(4000);
          }
        }

        await page?.waitForTimeout?.(9000);
      } catch (error: any) {
        await page.screenshot({ path: `upload-error-${Date.now()}.png` });
        throw new Error(`Image upload failed: ${error.message}`);
      }
    };

    const generateEvidences = async () => {
      try {
        if (!page.isClosed()) {
          // Remove the request listener first
          page.off("request", requestHandler);

          // Disable interception
          await page.setRequestInterception(false);

          // Reload page without interception
          await page.reload({
            waitUntil: "networkidle0",
            timeout: NAVIGATION_TIMEOUT,
          });

          await page?.waitForTimeout?.(5000);
          const screenshotPath = `evidence-${Date.now()}.png`;
          await page.screenshot({ path: screenshotPath });
          return screenshotPath;
        }
      } catch (err) {
        logger.warn("Could not generate evidence: " + err);
      }
      return "";
    };

    await navigateLogin();
    const publishButton = await pressPublishButton();
    await Promise.all([
      publishButton.click(),
      page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: NAVIGATION_TIMEOUT,
      }),
    ]);
    await setPlanSelection();
    await writeFillForm();
    await writeFillPrice(price.toString());
    await selectNegotiableOption();
    await pressContinueButton();
    await writeDescription(description);
    await uploadImages();

    const evidence = await generateEvidences();
    const fs = await import("fs/promises");
    const evidenceBuffer = await fs.readFile(evidence);
    const evidenceBase64 = evidenceBuffer.toString("base64");

    return {
      message: "Ad published successfully",
      evidence: {
        screenshot: `data:image/png;base64,${evidenceBase64}`,
        description,
        price,
      },
    };
  } catch (error) {
    const errorScreenshot = `error-${Date.now()}.png`;
    await page.screenshot({ path: errorScreenshot });
    console.error("Automation Error:", error);
    throw new Error(`Process failed. See ${errorScreenshot} for details.`);
  } finally {
    await browser.close();
  }
};
