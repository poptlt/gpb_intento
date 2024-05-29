#!C:\Strawberry\perl\bin\perl -w

use CGI;
use Data::Dumper;
use JSON;

my $co = new CGI;
print $co->header(-type => "application/json", -charset => "utf-8");

my $developer = 1;

my $data;
eval { $data = decode_json($co->param("POSTDATA")); }; 

if ($@) {

    if ($developer) { print "что-то не то с массивом запросов: ($@)"; }
    exit;
}

if (ref $data != 'ARRAY') {

    if ($developer) { print "что-то не то с массивом запросов: (Dumper($data))"; }
    exit;    
}

my $app = do './app.pl';
my %ctx = (user => 'gpbu123');

my @arr = ();

foreach my $query (@{$data}) {

    my $id = ${$query}{id};
    my $method = ${$query}{method};
    my @params = @{${$query}{params}};

    my $result;
    my %error = ();
    eval { $result = $app->exec($method, (@params, \%ctx)); };

    if ($@) {

        my @parts = split /:::/, $@;

        if (@parts > 1) {
        
            $error{code} = $parts[0];
            if ($error{code} == 'USER') { $error{message} = $parts[1]; }
        } else {

            $error{code} = 'SYSTEM';  
        }  

        if ($developer) { $error{source} = $@ };
    }

    my %res = (id => $id);

    if (%error) { 
        $res{error} = \%error; 
    } else {
        $res{result} = $result;
    }

    push @arr, \%res; 
}

print encode_json \@arr;



