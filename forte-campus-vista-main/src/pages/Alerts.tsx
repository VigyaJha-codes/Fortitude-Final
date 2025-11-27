import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, TrendingDown, AlertCircle, RefreshCw, Send, Calendar } from 'lucide-react';

interface Alert {
  id: string;
  student_id: string;
  student_name: string;
  reason: string;
  risk_level: string;
  risk_score: number;
  timestamp: string;
  top_drivers: any[];
}

export default function Alerts() {
  const { userRole } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          student_id,
          reason,
          risk_level,
          risk_score,
          timestamp,
          top_drivers,
          students (
            full_name
          )
        `)
        .order('risk_score', { ascending: false });

      if (error) throw error;

      const formattedAlerts = (data || []).map((alert: any) => ({
        id: alert.id,
        student_id: alert.student_id,
        student_name: alert.students?.full_name || 'Unknown',
        reason: alert.reason,
        risk_level: alert.risk_level,
        risk_score: alert.risk_score,
        timestamp: alert.timestamp,
        top_drivers: alert.top_drivers || [],
      }));

      setAlerts(formattedAlerts);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const computeAlerts = async () => {
    setComputing(true);
    try {
      const { error } = await supabase.functions.invoke('compute-alerts');
      
      if (error) throw error;

      toast({ title: 'Success', description: 'Alerts computed successfully' });
      await fetchAlerts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setComputing(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <TrendingDown className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-info" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-l-destructive bg-destructive/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      default:
        return 'border-l-info bg-info/5';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Early Alerts</h2>
            <p className="text-muted-foreground">
              {userRole === 'admin' ? 'Monitor student risk levels across the institution' : 'View at-risk students in your courses'}
            </p>
          </div>
          {(userRole === 'admin' || userRole === 'faculty') && (
            <Button 
              onClick={computeAlerts} 
              disabled={computing}
              className="btn-gradient-primary"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${computing ? 'animate-spin' : ''}`} />
              {computing ? 'Computing...' : 'Recompute Alerts'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Alerts Found</h3>
              <p className="text-muted-foreground">
                Great news! There are no students at risk currently.
              </p>
              {(userRole === 'admin' || userRole === 'faculty') && (
                <Button 
                  onClick={computeAlerts} 
                  className="mt-4"
                  variant="outline"
                >
                  Compute Alerts Now
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Card
                key={alert.id}
                className={`glass-card hover-lift transition-smooth border-l-4 ${getRiskColor(alert.risk_level)}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getRiskIcon(alert.risk_level)}
                      <div>
                        <CardTitle className="text-lg">{alert.student_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="uppercase font-semibold">{alert.risk_level} Risk</span>
                          <span>•</span>
                          <span>Score: {alert.risk_score}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Reason:</p>
                    <p className="text-sm text-muted-foreground">{alert.reason}</p>
                  </div>

                  {alert.top_drivers && alert.top_drivers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Contributing Factors:</p>
                      <div className="space-y-2">
                        {alert.top_drivers.map((driver: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{driver.feature}:</span>
                            <span className="font-semibold">
                              {driver.value.toFixed(1)}% (Impact: {driver.contribution}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(userRole === 'admin' || userRole === 'faculty') && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Counselling
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}