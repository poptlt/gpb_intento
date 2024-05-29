my $app = RPC_APP->new();

$app->add_sub('sum', sub {
    my ($a, $b) = @_;
    $a + $b
});

$app->add_sub('mult', sub {
    my ($a, $b) = @_;
    $a * $b
});

return $app;