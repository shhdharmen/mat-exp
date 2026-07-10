import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { MarkdownComponent } from '../markdown/markdown.component';
import { MarkdownService } from '../../shared/services/markdown.service';
import { environment } from '../../../environments/environment';
import {
  breadcrumbListJsonLd,
  faqPageJsonLd,
  productJsonLd,
  withBaseJsonLd,
} from '../../shared/utils/json-ld';

interface FaqEntry {
  q: string;
  a: string;
}

interface FaqCategory {
  heading: string;
  entries: FaqEntry[];
}

interface RenderedFaqEntry {
  q: string;
  html: string;
}

interface RenderedFaqCategory {
  heading: string;
  entries: RenderedFaqEntry[];
}

const RAW_FAQ_CATEGORIES: FaqCategory[] = [
  {
    heading: 'General',
    entries: [
      {
        q: 'What is Mat Expressive?',
        a: '`@ngm-dev/mat-expressive` is an Angular component library that extends Angular Material with expressive, motion-rich UI components following Material Design 3 guidelines.',
      },
      {
        q: 'Is it really free for non-commercial use?',
        a: 'Yes. The **PolyForm Noncommercial** license lets you use Mat Expressive at no cost for personal projects, open-source work, education, and non-profit purposes — forever.',
      },
      {
        q: "What's the difference between the two tiers?",
        a: `The **Non-Commercial** tier covers any use that is not primarily intended for commercial advantage or monetary compensation.

The **Commercial** tier covers everything else — for-profit products, SaaS, internal business tools, and client work.`,
      },
      {
        q: 'Do I need to create an account to use the free tier?',
        a: 'No account required. Install the package from npm and follow the [getting-started guide](/docs/getting-started/installation). A commercial license requires a one-time purchase via Polar.sh.',
      },
    ],
  },
  {
    heading: 'Licensing',
    entries: [
      {
        q: 'What counts as commercial use?',
        a: `Commercial use is any use primarily intended for commercial advantage or monetary compensation. This includes:

- SaaS products and for-profit applications
- Internal business tools at a for-profit company
- Client projects where you are paid to build the product`,
      },
      {
        q: 'Do freelancers need a commercial license?',
        a: 'Yes. If you are building a product or website for a client and receiving payment for that work, you need a commercial license. The one-time fee covers **all** your client projects.',
      },
      {
        q: 'What about open-source projects?',
        a: `OSI-approved open-source licenses are covered by the Non-Commercial tier at no cost.

If your open-source project is backed by a commercial entity and used to drive revenue, a commercial license is required.`,
      },
      {
        q: "What about startups that aren't yet generating revenue?",
        a: "If you are building a product with the intention of generating revenue — even if you haven't yet — you need a commercial license. The one-time fee is designed to be accessible at every stage.",
      },
      {
        q: 'Can I use my commercial license for client projects?',
        a: `The organization that commercially exploits projects built with \`@ngm-dev/mat-expressive\` must hold its own commercial license. If you transfer the source code to a client whose developers will maintain or extend it, the client needs their own license.

You can facilitate this: purchase a license on behalf of your client through Polar.sh and bill them accordingly. Once purchased, the Polar.sh receipt serves as proof of ownership — pass it to your client for their records.

For questions, contact [support@angular-material.dev](mailto:support@angular-material.dev).`,
      },
    ],
  },
  {
    heading: 'Product',
    entries: [
      {
        q: 'What does "lifetime license" mean?',
        a: 'A commercial license is a **one-time purchase** that grants you perpetual rights to use any version of Mat Expressive released at the time of purchase or in the future. You will never be asked to pay again.',
      },
      {
        q: 'Does the license cover major version upgrades?',
        a: 'Yes. All future major versions are included. A single purchase keeps you covered as the library evolves.',
      },
      {
        q: 'Is support included with the commercial license?',
        a: 'Community support via [GitHub Issues](https://github.com/Angular-Material-Dev/community/issues) is available to all users. Commercial license holders receive priority issue responses and access to a dedicated support channel.',
      },
      {
        q: 'Can I use the commercial license across multiple projects?',
        a: 'Yes. The commercial license covers **unlimited developers** and **unlimited projects** within your organization.',
      },
    ],
  },
  {
    heading: 'Support',
    entries: [
      {
        q: 'How do I get help?',
        a: 'Open an issue on [GitHub](https://github.com/Angular-Material-Dev/community/issues) for bugs or feature requests. Commercial license holders can also reach out through the dedicated support channel linked in their purchase confirmation.',
      },
      {
        q: 'What are the response times?',
        a: 'Community issues are triaged on a best-effort basis. Commercial license holders receive priority responses, typically within **7 business days**.',
      },
      {
        q: 'Is enterprise support available?',
        a: 'For teams needing SLA guarantees, dedicated onboarding, or custom feature development, contact us at [support@angular-material.dev](mailto:support@angular-material.dev) to discuss enterprise arrangements.',
      },
    ],
  },
  {
    heading: 'Miscellaneous',
    entries: [
      {
        q: 'What is your refund policy?',
        a: 'We offer a **30-day no-questions-asked refund**. Contact us within 30 days of purchase and we will issue a full refund. See our [Refund Policy](/refund-policy) for details.',
      },
      {
        q: 'Can I buy licenses for my whole team?',
        a: 'The commercial license already covers unlimited developers and projects within your organization, so a single purchase is all you need regardless of team size.',
      },
      {
        q: 'Is the license transferable?',
        a: 'The commercial license is tied to the purchasing organization and is not transferable to a different legal entity. If your company is acquired, contact us at [support@angular-material.dev](mailto:support@angular-material.dev) to discuss a transfer.',
      },
    ],
  },
];

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatExpansionModule, MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {},
  templateUrl: './pricing-page.component.html',
})
export class PricingPageComponent {
  private readonly markdownService = inject(MarkdownService);

  protected readonly licensePrice = environment.licensePrice;
  protected readonly polarUrl = environment.polarUrl;

  protected readonly freeBullets: string[] = [
    'Personal projects',
    'Open-source (OSI-approved)',
    'Students & educational',
    'Non-profit organizations',
    'Evaluation & prototyping',
  ];

  protected readonly commercialBullets: string[] = [
    'Everything in Non-Commercial',
    'For-profit products & SaaS',
    'Internal company tools',
    'Client work & freelance projects',
  ];

  protected readonly renderedFaqCategories = signal<RenderedFaqCategory[]>([]);

  constructor() {
    const faqEntries = RAW_FAQ_CATEGORIES.flatMap((cat) =>
      cat.entries.map((entry) => ({ question: entry.q, answer: entry.a })),
    );

    inject(NgxMetaService).set({
      title: 'Pricing',
      description:
        'Free for non-commercial use under the PolyForm Noncommercial license. A one-time payment unlocks a lifetime commercial license for @ngm-dev/mat-expressive.',
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd([
          { name: 'Mat Expressive', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ]),
        productJsonLd([
          {
            name: 'Non-Commercial',
            description: 'Free for non-commercial use, forever.',
            price: 0,
          },
          {
            name: 'Commercial',
            description: 'One-time payment for a lifetime commercial license.',
            price: this.licensePrice,
          },
        ]),
        faqPageJsonLd(faqEntries),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
    void this.renderFaqAnswers();
  }

  private async renderFaqAnswers(): Promise<void> {
    const rendered = await Promise.all(
      RAW_FAQ_CATEGORIES.map(async (cat) => ({
        heading: cat.heading,
        entries: await Promise.all(
          cat.entries.map(async (entry) => ({
            q: entry.q,
            html: await this.markdownService.renderMarkdown(entry.a),
          })),
        ),
      })),
    );
    this.renderedFaqCategories.set(rendered);
  }
}
