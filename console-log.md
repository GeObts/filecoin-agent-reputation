## Error Type

Console Error

## Error Message

In HTML, <a> cannot be a descendant of <a>.
This will cause a hydration error.

...
<HTTPAccessFallbackErrorBoundary pathname="/" notFound={<SegmentViewNode>} forbidden={undefined} ...>
<RedirectBoundary>
<RedirectErrorBoundary router={{...}}>
<InnerLayoutRouter url="/" tree={[...]} params={{}} cacheNode={{rsc:<Fragment>, ...}} segmentPath={[...]} ...>
<SegmentViewNode type="page" pagePath="page.tsx">
<SegmentTrieNode>
<ClientPageRoot Component={function DashboardPage} serverProvidedParams={{...}}>
<DashboardPage params={Promise} searchParams={Promise}>
<div className="mx-auto ma...">
<section>
<section>
<section>
<section>
<h2>
<div className="space-y-3">
<AgentCard address="0x0eD39Ba9..." score={400} isActive={true} registeredAt={1773248954}>
<LinkComponent href="/agent/0x0...">

>                           <a
>                             ref={function}
>                             onClick={function onClick}
>                             onMouseEnter={function onMouseEnter}
>                             onTouchStart={function onTouchStart}
>                             href="/agent/0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4"
>                           >

                              ...
                                <div className="flex flex-...">
                                  <AddressDisplay address="0x0eD39Ba9...">
                                    <div className="flex items...">
                                      <code>
                                      <Button>

>                                     <a
>                                       href="https://sepolia.basescan.org/address/0x0eD39Ba9Ab663A20D65cc6e3927dDe40e..."
>                                       target="_blank"
>                                       rel="noopener noreferrer"
>                                     >

                                  ...
            ...
          ...



    at a (<anonymous>:null:null)
    at AddressDisplay (src/components/agent/address-display.tsx:32:7)
    at AgentCard (src/components/agent/agent-card.tsx:23:13)
    at <unknown> (src/app/page.tsx:94:17)
    at Array.map (<anonymous>:null:null)
    at DashboardPage (src/app/page.tsx:79:23)

## Code Frame

30 | <span className="sr-only">Copy address</span>
31 | </Button>

> 32 | <a href={baseScanUrl} target="_blank" rel="noopener noreferrer">

     |       ^

33 | <Button variant="ghost" size="icon" className="h-6 w-6">
34 | <ExternalLink className="h-3 w-3" />
35 | <span className="sr-only">View on BaseScan</span>

Next.js version: 16.1.6 (Turbopack)

## Error Type

Console Error

## Error Message

<a> cannot contain a nested <a>.
See this log for the ancestor stack trace.

    at a (<anonymous>:null:null)
    at AgentCard (src/components/agent/agent-card.tsx:19:5)
    at <unknown> (src/app/page.tsx:94:17)
    at Array.map (<anonymous>:null:null)
    at DashboardPage (src/app/page.tsx:79:23)

## Code Frame

17 |
18 | return (

> 19 | <Link href={`/agent/${address}`}>

     |     ^

20 | <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
21 | <CardContent className="flex items-center justify-between p-4">
22 | <div className="flex flex-col gap-1">

Next.js version: 16.1.6 (Turbopack)
