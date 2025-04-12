import { NextRequest, NextResponse } from 'next/server';

// Mock function simulating the search service
async function mockSearchService(query: string, isLucky: boolean = false) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const answer = "ServiceNow is a cloud computing platform that automates IT business management workflows. It includes products for IT service, operations, and business management. The core of ServiceNow's platform is IT service management (ITSM), which helps organizations to consolidate and automate service relationships across the enterprise.\n\nServiceNow was founded in 2004 by Fred Luddy, who previously served as CTO at Peregrine Systems and Remedy Corporation. The company initially focused on IT service management but has since expanded into other areas like IT operations management, IT business management, customer service management, HR service delivery, and security operations.\n\nServiceNow's platform is built on a single data model and uses a common service data platform. This allows for seamless integration between different modules and applications. The platform includes features such as workflow automation, AI and machine learning capabilities, virtual agents, performance analytics, and a mobile experience.\n\nMany large enterprises use ServiceNow to manage their IT services and business workflows. The platform is highly customizable and can be tailored to meet specific organizational needs. ServiceNow also offers a developer program that allows developers to build custom applications on the Now Platform.";
  
  const results = [
    {
      title: "What is ServiceNow? | ServiceNow",
      url: "https://www.servicenow.com/what-is-servicenow.html",
      snippet: "ServiceNow is a platform that enables digital workflows to drive business growth, increase resilience, and enhance employee productivity..."
    },
    {
      title: "ServiceNow - Wikipedia",
      url: "https://en.wikipedia.org/wiki/ServiceNow",
      snippet: "ServiceNow is an American software company based in Santa Clara, California that develops a cloud computing platform to help companies manage digital workflows..."
    },
    {
      title: "ServiceNow - Overview, Products, Competitors",
      url: "https://docs.servicenow.com/bundle/tokyo-platform-administration/page/administer/overview",
      snippet: "ServiceNow is a software platform that enables organizations to manage digital workflows for enterprise operations. ServiceNow provides cloud-based solutions..."
    },
    {
      title: "ServiceNow Developer Documentation",
      url: "https://developer.servicenow.com/dev.do",
      snippet: "ServiceNow Developer documentation provides resources for building applications on the Now Platform. Find guides, API references, and more..."
    },
    {
      title: "ServiceNow Community Forums",
      url: "https://community.servicenow.com",
      snippet: "Connect with ServiceNow experts, ask questions, share ideas, and access resources to make the most of your ServiceNow implementation..."
    }
  ];

  return {
    answer,
    results: isLucky ? [] : results
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query, isLucky = false } = await request.json();
    
    // Log the query (optional - for debugging)
    console.log(`Search query received: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    console.log(`Is Lucky mode: ${isLucky}`);
    
    // In a real implementation, this would call your search/AI service
    const { answer, results } = await mockSearchService(query, isLucky);
    
    return NextResponse.json({ 
      answer, 
      results,
      // Include a shortened version of the query for reference
      queryPreview: query.length > 50 ? `${query.substring(0, 50)}...` : query 
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to process search query' },
      { status: 500 }
    );
  }
} 