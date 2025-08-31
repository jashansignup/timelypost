import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories: { name: string; description: string }[] = [
  {
    name: "Web Development",
    description:
      "Covers modern web frameworks, frontend trends, rendering strategies, and best practices for building interactive, scalable, and maintainable web applications using the latest tools and technologies.",
  },
  {
    name: "System Design",
    description:
      "Explores architectural patterns, scalability strategies, database design, caching, microservices vs monoliths, and best practices for building robust systems that handle millions of users efficiently.",
  },
  {
    name: "Data Engineering",
    description:
      "Guides on relational and NoSQL databases, data modeling, indexing, migrations, query optimization, and scaling data infrastructure to power real-time and analytical applications.",
  },
  {
    name: "Cloud DevOps",
    description:
      "Focuses on deployment, CI/CD pipelines, containerization, monitoring, infrastructure as code, and automation strategies that streamline development workflows and ensure reliable production systems.",
  },
  {
    name: "App Performance",
    description:
      "Techniques to boost speed, scalability, and efficiency of applications—covering caching, code splitting, lazy loading, profiling, and best practices for reducing latency and improving user experience.",
  },
  {
    name: "App Security",
    description:
      "Discusses modern security practices: authentication flows, authorization, encryption, rate limiting, secure secrets, threat modeling, and compliance to protect applications and user data.",
  },
  {
    name: "API Design",
    description:
      "Covers REST, GraphQL, gRPC, and webhooks—designing APIs, versioning, handling integrations, and ensuring reliability with retries, error handling, and scalable architecture choices.",
  },
  {
    name: "Software Testing",
    description:
      "Explores unit testing, integration testing, end-to-end testing, test automation, continuous quality checks, and strategies for shipping bug-free, production-ready applications with confidence.",
  },
  {
    name: "Dev Tutorials",
    description:
      "Step-by-step guides, walkthroughs, and hands-on tutorials for developers of all levels—covering key concepts, project setups, and practical implementations for learning by doing.",
  },
  {
    name: "Tech Updates",
    description:
      "A space for announcements, product updates, release notes, and new feature overviews, helping readers stay up-to-date with evolving technology and improvements in tools and practices.",
  },
];

for (const category of categories) {
  try {
    await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        slug: category.name.toLowerCase().replace(/\s+/g, "-"),
      },
    });
  } catch (e) {
    console.log(e);
  }
}

prisma.$disconnect();
