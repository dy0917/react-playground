# Microsoft Foundry Deployment Types: Case Study Study Manual
HOTSPOT
Case Study
This is a case study. Case studies are not timed separately from other exam sections. You can use as much exam time as you would like to complete each case study. However, there might be additional case studies or other exam sections. Manage your time to ensure that you can complete all the exam sections in the time provided. Pay attention to the Exam Progress at the top of the screen so you have sufficient time to complete any exam sections that follow this case study.
To answer the case study questions, you will bed to reference information that is provided in the case. Case studies and associated questions might contain exhibits or other resources that provide more information about the scenario described in the case. Information provided in an individual question does not apply to the other questions in the case study.
A Review Screen will appear at the end of this case study. From the Review Screen, you can review and change your answers before you move to the next exam section. After you leave this case study, you will NOT be able to return to it.
To start the case study
To display the first question in this case study, select the “Next” button. To the left of the question, a menu provides links to information such as business requirements, the existing environment, and problem statements. Please read through all this information before answering any questions. When you are ready to answer a question, select the “Question” button to return to the question.
Overview
Company Information
Contoso, Ltd is a multinational retail company that builds, deploys, and manages generative AI and agent-based solutions by using Microsoft Foundry.
Existing Environment
Identity Environment
Contoso uses Microsoft Entra ID for identity management, authentication, and authorization capabilities that enable agents to access organizational resources and services.
Contoso recently formed a new AI engineering team named Agent1Dev Team to optimize and maintain existing AI solutions.
The team collaborates with solution architects, DevOps engineers, and security engineers to design, implement. monitor, and secure AI applications.
Contoso also has a team named Agent1Test Team that is responsible for validating AI solutions before the solution deployments.
Generative Environment
Contoso has a Microsoft Foundry deployment that contains two projects named Project1 and Project2.
Project1
Project1 contains a customer support agent named Agent1 that assists customers with product inquiries and troubleshooting requests.
Agent1 has the following configurations:
Agent1 uses a base model deployment.
A safety evaluation pipeline is NOT enabled.
Tool invocation approval workflows are NOT enabled.
Conversation memory constraints are NOT configured.
Agent1 interacts with customers by using digital support channels and answers general questions about Contoso products.
Project1 is deployed to an Azure region located in the European Union (EU).
Agent1Dev Team will use Project1 to optimize and maintain Agent1.
Project2
Project2 contains a deployed video generation model. The marketing department at Contoso has access to Project2 and plans to use the model to develop a video creation solution.
Development of the solution is incomplete.
Data Environment
Contoso stores product-related information in Azure resources that support AI applications.
The Azure environment contains an Azure Blob Storage account named storage1 that stores product detail sheets for all the Contoso products.
The product sheets include specifications, feature descriptions, and product support information that Agent1 can use to answer customer questions. The product sheets are stored in the PDF format.
Problem Statements
Contoso identifies the following issues:
Agent1 has only general knowledge of the Contoso products.
A recent chat interaction with Agent1 was analyzed for sentiment. The results of the analysis have NOT been processed yet.
Agent1 does NOT use the detailed product information in the product sheets stored in storage1 when responding to customer questions.
The finance department at Contoso reports that vendor invoices must be reviewed manually to ensure that the invoices match the terms defined in the vendor contracts. The invoices contain tables, logos, and varied layouts that make the documents difficult to process consistently.
Requirements
Planned Changes
Contoso plans to implement the following changes:
Implement a solution for Project1 that analyzes the vendor invoices by evaluating both the visual layout and the textual content of the invoices, so that the invoice details can be verified against the vendor contract terms.
Update the base model deployment used by Agent1 and standardize the model version to ensure continuity and consistent responses.
Enable Agent1 to retrieve and use the detailed product information from the product sheets stored in storage1.
Implement an indexing solution for the product sheets that Agent1 can use to answer customer questions.
Complete the development of the video creation solution.
Technical Requirements
Contoso identifies the following technical requirements:
The model deployment used by Agent1 must support scalable, high-throughput generative AI workloads and dynamically scale to handle variable customer support traffic, without requiring reserved throughput capacity.
The product sheets must be processed by using an indexing pipeline that enables semantic and vector search, so that Agent1 can retrieve the relevant product information.
Responses generated by using the product sheet information must be relevant, complete, and accurate.
Agent1 must be able to use the product sheets to answer natural language questions about product details.
The model version used by Agent1 must remain consistent to ensure stable responses.
The data processed by the model must remain within the EU.
Security and Compliance Requirements
Contoso identifies the following security and compliance requirements:
API keys must NOT be used to access Foundry-deployed models.
Access to the Azure resources must follow the principle of least privilege.
The developers at Contoso must authenticate to Microsoft Foundry resources by using Microsoft Entra authentication.
Access to Project1 must be assigned to the members of Agent1Dev Team by using a security group named SC_Agent1_Dev.
Access to Project1 must be assigned to the members of Agent1Test Team by using a security group named SC_Agent1_Test.
Agent1 must never reveal customer information, even if a document that contains customer data is added erroneously to the product sheet repository in storage1.
The product sheets might contain images that include embedded text. Agent1 must be protected from malicious instructions potentially hidden within the images.
Business Requirements
Contoso identifies the following business requirements:
Users that interact with Agent1 must have a personalized experience in future interactions, including the ability for Agent1 to retain conversation context and recall relevant information from previous interactions.
Agent1 must answer questions only about the products sold by Contoso.
You need to configure the model deployment for Agent1 to meet the technical requirements.
What should you configure? To answer, select the appropriate options in the answer area.
NOTE: Each correct selection is worth one point.


what is the best option for deployment type: standard, global standard or global Provisioned

what is the best option for dversion update policy
## Case-study scenario

Contoso runs a customer-support agent, Agent1, in Microsoft Foundry Project1 in an EU region. The agent answers customer questions about Contoso products. Contoso plans to update its model deployment and has these requirements relevant to deployment configuration:

- Customer-support traffic varies, so the deployment must scale dynamically.
- The deployment must support high-throughput generative AI workloads.
- Contoso does not want to reserve throughput capacity.
- Data processed by the model must remain within the EU.
- The model version must remain consistent to provide stable responses.

## Recommended answers

| Setting | Selection | Why |
|---|---|---|
| Deployment type | **Standard** | It is the pay-as-you-go, non-provisioned choice. A regional Standard deployment can keep processing in the selected EU region. |
| Model version update policy | **No auto-upgrade** | It avoids an automatic model-version change, supporting the requirement for consistent behavior. Plan and test version upgrades deliberately. |

## How to reason about deployment type

The requirements should be considered together rather than using “high throughput” or “scalable” alone to choose a deployment:

1. **No reserved throughput capacity** rules out Provisioned deployment types. Provisioned capacity is reserved for the deployment; it is not simply a label for a workload that cannot scale.
2. **EU data residency** rules out global routing when it could process requests outside the EU.
3. Among the stated options, **Standard** is the best fit: it uses pay-as-you-go capacity and, when deployed regionally in the EU, keeps processing tied to that region.

Standard is not a guarantee of unlimited throughput. Confirm that the model and regional quota available to the deployment meet the workload's actual throughput needs.

## Comparing the options

| Deployment type | Capacity and scaling concept | Fit for this case |
|---|---|---|
| **Standard** | Pay-as-you-go, without reserving provisioned throughput; deploy in a specific region. | **Best fit**, provided regional model/quota availability meets demand and the deployment is in the EU. |
| **Global Standard** | Pay-as-you-go global deployment, intended to provide broad, dynamically routed capacity and high throughput. | Does not meet the case's EU-only processing constraint if requests may be routed outside the EU. |
| **Provisioned** | Reserves throughput capacity for a deployment, which can suit sustained, predictable demand and throughput needs. | Conflicts with the explicit requirement not to reserve throughput capacity. |
| **Global Provisioned** | Provisioned capacity with global processing/routing characteristics. | Conflicts with both the no-reservation requirement and the EU-only processing constraint. |

### Rule of thumb

- **Variable demand and no reservation:** prefer a Standard pay-as-you-go option, subject to residency and quota requirements.
- **High, steady, predictable demand where reserved capacity is acceptable:** consider Provisioned.
- **Global deployment types:** consider them only when the data-residency and processing-location requirements allow global routing.

“Scalable” does not automatically mean “Global Standard.” Global Standard can offer high throughput and dynamic routing, but compliance requirements can rule it out. Likewise, Provisioned can be scaled by adjusting reserved capacity, but it still requires reserved throughput.

## Why the version policy matters

The case says the model version must remain consistent. An automatic upgrade can change the model version without a deliberate deployment decision, potentially changing response behavior. **No auto-upgrade** is therefore the direct match. It does not mean “never upgrade”: the team should track version lifecycle dates, evaluate newer versions, test them, and schedule upgrades intentionally.

## Common exam traps

- Choosing **Provisioned** just because the prompt mentions high throughput. Check whether capacity reservation is allowed or explicitly required.
- Choosing **Global Standard** just because demand is variable. Check where requests may be processed and apply the residency requirement.
- Treating “scalable” and “reserved capacity” as opposites. Provisioned capacity can be adjusted, but it is still reserved; Standard is the non-provisioned pay-as-you-go option.
- Choosing an automatic model version update when stability is required. Prefer **No auto-upgrade**, then manage upgrades deliberately.

## Final answer for this case

**Deployment type: Standard**  
**Version update policy: No auto-upgrade**
