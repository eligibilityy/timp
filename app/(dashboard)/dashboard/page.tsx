import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Timer will go here</p>
        </CardContent>
      </Card>
    </div>
  )
}
